import os
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

with app.app_context():
    db.create_all()

def get_current_user_id():
    user_id = request.headers.get('X-User-ID') or request.args.get('user_id')
    if not user_id or str(user_id).strip().lower() in ['null', 'undefined', '']:
        return None
    return str(user_id).strip()


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

    # Remove physical file
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

@app.route('/static/uploads/<user_id>/<filename>')
def serve_uploaded_file(user_id, filename):
    return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER'], user_id), filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)