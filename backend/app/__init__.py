"""
Flask Application Factory
Demonstrates:
- Factory Pattern in Python (create_app)
- Blueprint registration
- CORS configuration
- Centralized JSON error handling
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.app.database.db import db

def create_app(test_config=None):
    app = Flask(__name__)

    # Default configuration
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, '..', 'smart_expense.db')

    app.config.from_mapping(
        SECRET_KEY='mca-python-data-science-secret-key',
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{db_path}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_SORT_KEYS=False
    )

    if test_config:
        app.config.update(test_config)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)

    # Register blueprints
    from backend.app.routes.health import health_bp
    from backend.app.routes.categories import categories_bp
    from backend.app.routes.transactions import transactions_bp
    from backend.app.routes.budgets import budgets_bp
    from backend.app.routes.analytics import analytics_bp
    from backend.app.routes.reports import reports_bp
    from backend.app.routes.demo import demo_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(budgets_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(demo_bp)

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': str(e.description) if hasattr(e, 'description') else 'Bad request'}), 400

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'An internal server error occurred. Please verify your request parameters.'}), 500

    # Auto-initialize tables and seed categories on startup
    with app.app_context():
        db.create_all()
        from backend.app.services.seed_data import init_default_categories
        init_default_categories()

    return app
