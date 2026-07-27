import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
INSTANCE_FOLDER = os.path.join(BASE_DIR, 'instance')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(INSTANCE_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'vault_db')

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:martin@localhost:5432/stylevault'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class VaultItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, index=True)
    url = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, default="")
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "url": self.url,
            "description": self.description,
            "display_order": self.display_order
        }


class UserProfile(db.Model):
    user_id = db.Column(db.String(100), primary_key=True)
    display_name = db.Column(db.String(100), default="")
    avatar_url = db.Column(db.String(300), default="")

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "display_name": self.display_name,
            "avatar_url": self.avatar_url
        }


class CommunityPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, index=True)
    url = db.Column(db.String(300), nullable=False)
    caption = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        profile = db.session.get(UserProfile, self.user_id)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "url": self.url,
            "caption": self.caption,
            "created_at": self.created_at.isoformat(),
            "display_name": profile.display_name if profile else "Anonymous",
            "avatar_url": profile.avatar_url if profile else ""
        }


with app.app_context():
    db.create_all()


def get_current_user_id():
    user_id = request.headers.get('X-User-ID') or request.args.get('user_id')
    if not user_id or str(user_id).strip().lower() in ['null', 'undefined', '']:
        return None
    return str(user_id).strip()


@app.route('/api/profile', methods=['GET'])
def get_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = db.session.get(UserProfile, user_id)
    if not profile:
        profile = UserProfile(user_id=user_id, display_name="", avatar_url="")
        db.session.add(profile)
        db.session.commit()

    return jsonify(profile.to_dict())


@app.route('/api/profile', methods=['PUT'])
def update_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    profile = db.session.get(UserProfile, user_id)
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.session.add(profile)

    display_name = request.form.get('display_name')
    if display_name is not None:
        profile.display_name = display_name

    if 'avatar' in request.files:
        file = request.files['avatar']
        if file and file.filename:
            user_upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
            os.makedirs(user_upload_dir, exist_ok=True)

            filename = secure_filename(file.filename)
            unique_filename = f"avatar_{os.urandom(4).hex()}_{filename}"
            filepath = os.path.join(user_upload_dir, unique_filename)
            file.save(filepath)

            profile.avatar_url = f"/static/uploads/{user_id}/{unique_filename}"

    db.session.commit()
    return jsonify(profile.to_dict())


@app.route('/api/vault', methods=['GET'])
def get_vault():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    items = VaultItem.query.filter_by(user_id=user_id)\
        .order_by(VaultItem.display_order.asc(), VaultItem.id.desc()).all()
    return jsonify([item.to_dict() for item in items])


@app.route('/api/vault/upload', methods=['POST'])
def upload_images():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    files = request.files.getlist('images')
    if not files:
        return jsonify({"error": "No files provided"}), 400

    user_upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
    os.makedirs(user_upload_dir, exist_ok=True)

    new_items = []
    for file in files:
        if not file.filename:
            continue

        filename = secure_filename(file.filename)
        unique_filename = f"{os.urandom(4).hex()}_{filename}"
        filepath = os.path.join(user_upload_dir, unique_filename)
        file.save(filepath)

        item = VaultItem(
            user_id=user_id,
            url=f"/static/uploads/{user_id}/{unique_filename}"
        )
        db.session.add(item)
        new_items.append(item)

    db.session.commit()
    return jsonify([item.to_dict() for item in new_items]), 201


@app.route('/api/vault/<int:item_id>', methods=['PUT'])
def update_description(item_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    item = db.session.get(VaultItem, item_id)
    if not item or item.user_id != user_id:
        return jsonify({"error": "Item not found"}), 404

    item.description = request.json.get('description', item.description)
    db.session.commit()
    return jsonify(item.to_dict())


@app.route('/api/vault/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    item = db.session.get(VaultItem, item_id)
    if not item or item.user_id != user_id:
        return jsonify({"error": "Item not found"}), 404

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], user_id, os.path.basename(item.url))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(item)
    db.session.commit()
    return jsonify({"success": True}), 200


@app.route('/api/vault/reorder', methods=['POST'])
def reorder_items():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    for position, item_id in enumerate(request.json.get('order', [])):
        item = db.session.get(VaultItem, item_id)
        if item and item.user_id == user_id:
            item.display_order = position

    db.session.commit()
    return jsonify({"success": True})


@app.route('/api/community/feed', methods=['GET'])
def get_community_feed():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    posts = CommunityPost.query.order_by(CommunityPost.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts])


@app.route('/api/community/post', methods=['POST'])
def create_community_post():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    caption = request.form.get('caption', '')

    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    if not file or not file.filename:
        return jsonify({"error": "Invalid file"}), 400

    user_upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], user_id)
    os.makedirs(user_upload_dir, exist_ok=True)

    filename = secure_filename(file.filename)
    unique_filename = f"comm_{os.urandom(4).hex()}_{filename}"
    filepath = os.path.join(user_upload_dir, unique_filename)
    file.save(filepath)

    post = CommunityPost(
        user_id=user_id,
        url=f"/static/uploads/{user_id}/{unique_filename}",
        caption=caption
    )

    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@app.route('/api/community/post/<int:post_id>', methods=['DELETE'])
def delete_community_post(post_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    post = db.session.get(CommunityPost, post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if post.user_id != user_id:
        return jsonify({"error": "Forbidden: You can only delete your own posts"}), 403

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], user_id, os.path.basename(post.url))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(post)
    db.session.commit()
    return jsonify({"success": True}), 200


@app.route('/static/uploads/<user_id>/<filename>')
def serve_uploaded_file(user_id, filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], user_id), filename)


if __name__ == '__main__':
    app.run(debug=True, port=5000)