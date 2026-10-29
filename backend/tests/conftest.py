"""
Pytest Test Fixtures and Configuration
"""
import pytest
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app import create_app
from backend.app.database.db import db
from backend.app.models.category import Category
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget

@pytest.fixture
def app():
    """Create and configure a clean test app instance with in-memory SQLite."""
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    })

    with app.app_context():
        db.create_all()
        # Seed test categories
        cats = [
            Category(name='Food', type='expense', icon='utensils', color='#f97316'),
            Category(name='Travel', type='expense', icon='bus', color='#0284c7'),
            Category(name='Salary', type='income', icon='briefcase', color='#16a34a'),
            Category(name='Freelance', type='income', icon='laptop', color='#059669'),
        ]
        db.session.bulk_save_objects(cats)
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client fixture."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """CLI runner fixture."""
    return app.test_cli_runner()
