"""
Demo & Maintenance API Blueprint
Demonstrates:
- Safe sample data lifecycle operations
- Clear isolation of user records vs synthetic demo fixtures
"""
from flask import Blueprint, jsonify
from backend.app.database.db import db
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget
from backend.app.services.seed_data import seed_sample_data, clear_sample_data, init_default_categories

demo_bp = Blueprint('demo', __name__)

@demo_bp.route('/api/demo/seed', methods=['POST'])
def handle_seed():
    count = seed_sample_data()
    return jsonify({
        'message': f"Successfully seeded {count} sample transactions and demo budgets.",
        'count': count
    }), 201


@demo_bp.route('/api/demo/clear', methods=['POST'])
def handle_clear():
    deleted_count = clear_sample_data()
    return jsonify({
        'message': f"Safely deleted {deleted_count} sample transaction records. User-created records remain untouched.",
        'deleted_count': deleted_count
    }), 200


@demo_bp.route('/api/demo/reset-all', methods=['POST'])
def handle_reset_all():
    # Delete all transactions & budgets, then re-seed
    Transaction.query.delete()
    Budget.query.delete()
    db.session.commit()

    init_default_categories()
    count = seed_sample_data()

    return jsonify({
        'message': f"Database reset complete with {count} demonstration records and initial categories.",
        'count': count
    }), 200
