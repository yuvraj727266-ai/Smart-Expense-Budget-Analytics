"""
Transaction API Endpoints
Demonstrates:
- Complete CRUD operations
- Dynamic querying, filtering, multi-field sorting, and pagination
- Strict payload validation and sanitization
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.app.database.db import db
from backend.app.models.transaction import Transaction
from backend.app.models.category import Category

transactions_bp = Blueprint('transactions', __name__)

VALID_PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Bank Transfer', 'Other']

@transactions_bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    query = Transaction.query

    # Filters
    tx_type = request.args.get('type')
    category_id = request.args.get('category_id', type=int)
    payment_method = request.args.get('payment_method')
    search = request.args.get('search')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    month_year = request.args.get('month_year')  # format 'YYYY-MM'

    if tx_type and tx_type in ['income', 'expense']:
        query = query.filter(Transaction.type == tx_type)

    if category_id:
        query = query.filter(Transaction.category_id == category_id)

    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)

    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))

    if month_year:
        try:
            # Match beginning of month to end of month
            parts = month_year.split('-')
            year, month = int(parts[0]), int(parts[1])
            start = datetime(year, month, 1).date()
            if month == 12:
                end = datetime(year + 1, 1, 1).date()
            else:
                end = datetime(year, month + 1, 1).date()
            query = query.filter(Transaction.date >= start, Transaction.date < end)
        except Exception:
            pass

    if start_date:
        try:
            s_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date >= s_date)
        except ValueError:
            pass

    if end_date:
        try:
            e_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date <= e_date)
        except ValueError:
            pass

    # Sorting
    sort_by = request.args.get('sort_by', 'date')
    sort_order = request.args.get('sort_order', 'desc')

    sort_column = getattr(Transaction, sort_by, Transaction.date)
    if sort_order == 'asc':
        query = query.order_by(sort_column.asc(), Transaction.id.asc())
    else:
        query = query.order_by(sort_column.desc(), Transaction.id.desc())

    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    if per_page <= 0:
        # Return all results without pagination
        items = query.all()
        return jsonify({
            'items': [t.to_dict() for t in items],
            'total': len(items),
            'page': 1,
            'pages': 1,
            'per_page': len(items)
        }), 200

    pagination = query.paginate(page=page, per_page=min(per_page, 100), error_out=False)

    return jsonify({
        'items': [t.to_dict() for t in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
        'per_page': pagination.per_page
    }), 200


@transactions_bp.route('/api/transactions/<int:tx_id>', methods=['GET'])
def get_transaction(tx_id):
    tx = db.session.get(Transaction, tx_id)
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
    return jsonify(tx.to_dict()), 200


@transactions_bp.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json() or {}

    description = data.get('description', '').strip()
    amount = data.get('amount')
    tx_type = data.get('type', '').strip().lower()
    category_id = data.get('category_id')
    date_str = data.get('date', '').strip()
    payment_method = data.get('payment_method', 'UPI').strip()
    notes = data.get('notes', '').strip()

    # Validations
    if not description:
        return jsonify({'error': 'Description is required'}), 400

    try:
        amount_val = round(float(amount), 2)
        if amount_val <= 0:
            return jsonify({'error': 'Amount must be greater than zero'}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'Valid numeric amount is required'}), 400

    if tx_type not in ['income', 'expense']:
        return jsonify({'error': "Transaction type must be 'income' or 'expense'"}), 400

    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({'error': f"Category with id {category_id} not found"}), 400

    try:
        parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD'}), 400

    if payment_method not in VALID_PAYMENT_METHODS:
        payment_method = 'Other'

    tx = Transaction(
        description=description,
        amount=amount_val,
        type=tx_type,
        category_id=category.id,
        date=parsed_date,
        payment_method=payment_method,
        notes=notes,
        is_sample=False
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify(tx.to_dict()), 201


@transactions_bp.route('/api/transactions/<int:tx_id>', methods=['PUT'])
def update_transaction(tx_id):
    tx = db.session.get(Transaction, tx_id)
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404

    data = request.get_json() or {}

    if 'description' in data:
        desc = data['description'].strip()
        if not desc:
            return jsonify({'error': 'Description cannot be empty'}), 400
        tx.description = desc

    if 'amount' in data:
        try:
            amt = round(float(data['amount']), 2)
            if amt <= 0:
                return jsonify({'error': 'Amount must be greater than zero'}), 400
            tx.amount = amt
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid numeric amount'}), 400

    if 'type' in data:
        new_type = data['type'].strip().lower()
        if new_type not in ['income', 'expense']:
            return jsonify({'error': "Type must be 'income' or 'expense'"}), 400
        tx.type = new_type

    if 'category_id' in data:
        category = db.session.get(Category, data['category_id'])
        if not category:
            return jsonify({'error': 'Category not found'}), 400
        tx.category_id = category.id

    if 'date' in data:
        try:
            tx.date = datetime.strptime(data['date'].strip(), '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD'}), 400

    if 'payment_method' in data:
        tx.payment_method = data['payment_method'].strip()

    if 'notes' in data:
        tx.notes = data['notes']

    db.session.commit()
    return jsonify(tx.to_dict()), 200


@transactions_bp.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
def delete_transaction(tx_id):
    tx = db.session.get(Transaction, tx_id)
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404

    db.session.delete(tx)
    db.session.commit()
    return jsonify({'message': f"Transaction {tx_id} deleted successfully"}), 200
