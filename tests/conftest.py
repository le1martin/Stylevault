import sys
import os
import pytest

# Point to the backend directory where app.py lives
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import app as flask_app, db

@pytest.fixture
def client():
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()