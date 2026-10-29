"""
Health Check Route
"""
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
def check_health():
    return jsonify({
        'status': 'healthy',
        'system': 'Smart Expense & Budget Analytics System',
        'version': '1.0.0',
        'academic_level': 'MCA Data Science Mini-Project'
    }), 200
