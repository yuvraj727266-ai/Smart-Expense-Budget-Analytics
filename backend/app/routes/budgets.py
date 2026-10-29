"""
Budget API Endpoints
Demonstrates:
- Budget limit CRUD
- Month and Category-level spending tracking
- Budget utilization, overrun detection, and warning thresholds (80% and 100%)
- Prevention of duplicate budgets per month/category
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.app.database.db import db
from backend.app.models.budget import Budget
from backend.app.models.category import Category
from backend.app.models.transaction import Transaction
from backend.app.services.financial_calculations import (
    calculate_budget_remaining,
    calculate_budget_utilization,
    get_days_remaining_in_month
)

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('/api/budgets', methods=['GET'])
def get_budgets():
    month_year = request.args.get('month_year')
    if not month_year:
        month_year = datetime.now().strftime('%Y-%m')

    budgets = Budget.query.filter_by(month_year=month_year).all()

    # Query expense transactions for this month to calculate real-time utilization
    try:
        parts = month_year.split('-')
        year, month = int(parts[0]), int(parts[1])
        start = datetime(year, month, 1).date()
        if month == 12:
            end = datetime(year + 1, 1, 1).date()
        else:
            end = datetime(year, month + 1, 1).date()
    except Exception:
        start = datetime.now().replace(day=1).date()
        end = datetime.now().date()

    month_expenses = Transaction.query.filter(
        Transaction.type == 'expense',
        Transaction.date >= start,
        Transaction.date < end
    ).all()

    # Calculate total overall expense
    total_spent_overall = sum(float(tx.amount) for tx in month_expenses)

    # Calculate category-wise spent map
    cat_spent_map = {}
    for tx in month_expenses:
        cat_spent_map[tx.category_id] = cat_spent_map.get(tx.category_id, 0.0) + float(tx.amount)

    days_remaining = get_days_remaining_in_month(f"{month_year}-01")

    enriched_budgets = []
    for b in budgets:
        b_dict = b.to_dict()
        budget_limit = float(b.amount)

        if b.category_id is None:
            # Overall monthly budget
            actual_spent = total_spent_overall
        else:
            actual_spent = cat_spent_map.get(b.category_id, 0.0)

        remaining = calculate_budget_remaining(budget_limit, actual_spent)
        utilization = calculate_budget_utilization(actual_spent, budget_limit)

        b_dict['actual_spent'] = round(actual_spent, 2)
        b_dict['remaining'] = round(remaining, 2)
        b_dict['utilization_pct'] = round(utilization, 2)
        b_dict['is_exceeded'] = actual_spent > budget_limit
        b_dict['is_warning'] = (utilization >= 80.0) and (actual_spent <= budget_limit)
        b_dict['days_remaining'] = days_remaining

        enriched_budgets.append(b_dict)

    # Sort overall budget first, then by category name
    enriched_budgets.sort(key=lambda x: (not x['is_overall'], x['category_name']))

    return jsonify({
        'month_year': month_year,
        'budgets': enriched_budgets,
        'days_remaining': days_remaining
    }), 200


@budgets_bp.route('/api/budgets', methods=['POST'])
def create_budget():
    data = request.get_json() or {}

    month_year = data.get('month_year', '').strip()
    category_id = data.get('category_id')  # None for overall
    amount = data.get('amount')

    if not month_year:
        return jsonify({'error': 'month_year is required (format YYYY-MM)'}), 400

    try:
        amount_val = round(float(amount), 2)
        if amount_val <= 0:
            return jsonify({'error': 'Budget amount must be greater than zero'}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'Valid numeric budget amount is required'}), 400

    if category_id is not None:
        category = db.session.get(Category, category_id)
        if not category:
            return jsonify({'error': f"Category with id {category_id} not found"}), 400

    # Check for duplicate
    existing = Budget.query.filter_by(month_year=month_year, category_id=category_id).first()
    if existing:
        cat_label = existing.category.name if existing.category else "Overall Budget"
        return jsonify({'error': f"A budget for {cat_label} in {month_year} already exists. Please edit the existing budget."}), 409

    budget = Budget(
        month_year=month_year,
        category_id=category_id,
        amount=amount_val
    )
    db.session.add(budget)
    db.session.commit()

    return jsonify(budget.to_dict()), 201


@budgets_bp.route('/api/budgets/<int:budget_id>', methods=['PUT'])
def update_budget(budget_id):
    budget = db.session.get(Budget, budget_id)
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    data = request.get_json() or {}

    if 'amount' in data:
        try:
            amt = round(float(data['amount']), 2)
            if amt <= 0:
                return jsonify({'error': 'Budget amount must be greater than zero'}), 400
            budget.amount = amt
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid numeric amount'}), 400

    db.session.commit()
    return jsonify(budget.to_dict()), 200


@budgets_bp.route('/api/budgets/<int:budget_id>', methods=['DELETE'])
def delete_budget(budget_id):
    budget = db.session.get(Budget, budget_id)
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    db.session.delete(budget)
    db.session.commit()
    return jsonify({'message': f"Budget {budget_id} deleted successfully"}), 200
