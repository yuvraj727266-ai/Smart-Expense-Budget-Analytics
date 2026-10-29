"""
Category API Endpoints
Demonstrates:
- RESTful category management
- Referential integrity protection (cannot delete categories with active transactions unless reassigned)
- Input validation and defensive error handling
"""
from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from backend.app.database.db import db
from backend.app.models.category import Category
from backend.app.models.transaction import Transaction

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/api/categories', methods=['GET'])
def get_categories():
    cat_type = request.args.get('type')  # optional filter: 'expense', 'income'
    query = Category.query

    if cat_type:
        query = query.filter(or_(Category.type == cat_type, Category.type == 'both'))

    categories = query.order_by(Category.name.asc()).all()
    return jsonify([c.to_dict() for c in categories]), 200


@categories_bp.route('/api/categories', methods=['POST'])
def create_category():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    cat_type = data.get('type', 'expense').strip().lower()
    icon = data.get('icon', 'tag').strip()
    color = data.get('color', '#10b981').strip()

    if not name:
        return jsonify({'error': 'Category name is required'}), 400

    if cat_type not in ['expense', 'income', 'both']:
        return jsonify({'error': "Category type must be 'expense', 'income', or 'both'"}), 400

    existing = Category.query.filter(Category.name.ilike(name)).first()
    if existing:
        return jsonify({'error': f"Category with name '{name}' already exists"}), 409

    category = Category(
        name=name,
        type=cat_type,
        icon=icon,
        color=color,
        is_default=False
    )
    db.session.add(category)
    db.session.commit()

    return jsonify(category.to_dict()), 201


@categories_bp.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    cat_type = data.get('type')
    icon = data.get('icon')
    color = data.get('color')

    if name:
        # Check collision with other categories
        existing = Category.query.filter(Category.name.ilike(name), Category.id != category_id).first()
        if existing:
            return jsonify({'error': f"Category with name '{name}' already exists"}), 409
        category.name = name

    if cat_type and cat_type in ['expense', 'income', 'both']:
        category.type = cat_type

    if icon:
        category.icon = icon

    if color:
        category.color = color

    db.session.commit()
    return jsonify(category.to_dict()), 200


@categories_bp.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404

    reassign_to_id = request.args.get('reassign_to', type=int)

    # Check if category has transactions attached
    linked_transactions = Transaction.query.filter_by(category_id=category_id).all()
    count = len(linked_transactions)

    if count > 0:
        if not reassign_to_id:
            return jsonify({
                'error': f"Cannot delete category '{category.name}' because it contains {count} transaction(s). Please reassign transactions to another category first.",
                'requires_reassign': True,
                'transaction_count': count
            }), 400

        target_category = db.session.get(Category, reassign_to_id)
        if not target_category or target_category.id == category_id:
            return jsonify({'error': 'Invalid reassign target category'}), 400

        # Safely reassign transactions
        for tx in linked_transactions:
            tx.category_id = target_category.id

    db.session.delete(category)
    db.session.commit()

    return jsonify({
        'message': f"Category '{category.name}' deleted successfully",
        'reassigned_count': count if reassign_to_id else 0
    }), 200
