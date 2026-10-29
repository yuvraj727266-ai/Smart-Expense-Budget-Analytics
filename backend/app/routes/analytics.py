"""
Analytics API Blueprint
Demonstrates:
- Dynamic data aggregation with Pandas & NumPy
- Dynamic financial insight generation
- Server-side Matplotlib/Seaborn visualization integration
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.insight_engine import InsightEngine
from backend.app.services.chart_service import ChartService

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard():
    month_year = request.args.get('month_year')
    if not month_year:
        month_year = datetime.now().strftime('%Y-%m')

    # Get overall budget for this month
    overall_budget_rec = Budget.query.filter_by(month_year=month_year, category_id=None).first()
    overall_budget = float(overall_budget_rec.amount) if overall_budget_rec else 0.0

    all_txs = Transaction.query.all()
    all_budgets = Budget.query.filter_by(month_year=month_year).all()

    summary = AnalyticsService.get_dashboard_summary(all_txs, current_month=month_year, overall_budget=overall_budget)
    category_breakdown = AnalyticsService.get_category_breakdown(all_txs, month_year=month_year, transaction_type='expense')
    monthly_comparison = AnalyticsService.get_monthly_comparison(all_txs, last_n_months=6)
    daily_trends = AnalyticsService.get_daily_spending_trend(all_txs, month_year=month_year)
    stats = AnalyticsService.get_expense_statistics(all_txs, month_year=month_year)
    insights = InsightEngine.generate_insights(all_txs, budgets=all_budgets, month_year=month_year)

    # Recent transactions (latest 5)
    recent = Transaction.query.order_by(Transaction.date.desc(), Transaction.id.desc()).limit(5).all()

    return jsonify({
        'summary': summary,
        'category_breakdown': category_breakdown,
        'monthly_comparison': monthly_comparison,
        'daily_trends': daily_trends,
        'statistics': stats,
        'insights': insights.get('items', [])[:4],
        'recent_transactions': [t.to_dict() for t in recent]
    }), 200


@analytics_bp.route('/api/analytics/monthly', methods=['GET'])
def get_monthly():
    months_count = request.args.get('months', 6, type=int)
    all_txs = Transaction.query.all()
    monthly_data = AnalyticsService.get_monthly_comparison(all_txs, last_n_months=months_count)
    return jsonify(monthly_data), 200


@analytics_bp.route('/api/analytics/categories', methods=['GET'])
def get_categories_breakdown():
    month_year = request.args.get('month_year')
    tx_type = request.args.get('type', 'expense')
    all_txs = Transaction.query.all()
    data = AnalyticsService.get_category_breakdown(all_txs, month_year=month_year, transaction_type=tx_type)
    return jsonify(data), 200


@analytics_bp.route('/api/analytics/trends', methods=['GET'])
def get_trends():
    month_year = request.args.get('month_year')
    all_txs = Transaction.query.all()
    daily_data = AnalyticsService.get_daily_spending_trend(all_txs, month_year=month_year)
    return jsonify(daily_data), 200


@analytics_bp.route('/api/analytics/distribution', methods=['GET'])
def get_distribution():
    month_year = request.args.get('month_year')
    all_txs = Transaction.query.all()
    stats = AnalyticsService.get_expense_statistics(all_txs, month_year=month_year)
    outliers = AnalyticsService.detect_outlier_transactions(all_txs)
    return jsonify({
        'statistics': stats,
        'outliers': outliers
    }), 200


@analytics_bp.route('/api/analytics/insights', methods=['GET'])
def get_insights():
    month_year = request.args.get('month_year')
    all_txs = Transaction.query.all()
    budgets = Budget.query.filter_by(month_year=month_year).all() if month_year else Budget.query.all()
    insights = InsightEngine.generate_insights(all_txs, budgets=budgets, month_year=month_year)
    return jsonify(insights), 200


@analytics_bp.route('/api/analytics/budget-performance', methods=['GET'])
def get_budget_performance():
    month_year = request.args.get('month_year')
    if not month_year:
        month_year = datetime.now().strftime('%Y-%m')

    budgets = Budget.query.filter_by(month_year=month_year).all()
    all_txs = Transaction.query.all()
    categories_breakdown = AnalyticsService.get_category_breakdown(all_txs, month_year=month_year, transaction_type='expense')
    cat_map = {c['category_name'].lower(): c['total_amount'] for c in categories_breakdown}

    overall_expense = sum(c['total_amount'] for c in categories_breakdown)

    perf = []
    for b in budgets:
        limit = float(b.amount)
        if b.is_overall:
            actual = overall_expense
        else:
            actual = cat_map.get(b.category.name.lower(), 0.0) if b.category else 0.0

        perf.append({
            'budget_id': b.id,
            'name': b.category.name if b.category else 'Overall Monthly Budget',
            'limit': limit,
            'actual': round(actual, 2),
            'remaining': round(limit - actual, 2),
            'utilization': round((actual / limit * 100.0) if limit > 0 else 0.0, 2),
            'is_over': actual > limit
        })

    return jsonify({
        'month_year': month_year,
        'performance': perf
    }), 200


@analytics_bp.route('/api/analytics/charts/matplotlib', methods=['GET'])
def get_matplotlib_chart():
    """
    Renders analytical charts using Matplotlib and Seaborn server-side.
    Returns base64 data URLs for seamless embedding in the React interface.
    """
    chart_type = request.args.get('type', 'donut')  # 'donut', 'bar', 'histogram', 'heatmap'
    month_year = request.args.get('month_year')

    all_txs = Transaction.query.all()

    if chart_type == 'donut':
        img = ChartService.generate_category_donut(all_txs, month_year=month_year)
    elif chart_type == 'bar':
        img = ChartService.generate_monthly_bar(all_txs)
    elif chart_type == 'histogram':
        img = ChartService.generate_histogram(all_txs)
    elif chart_type == 'heatmap':
        img = ChartService.generate_correlation_heatmap(all_txs)
    else:
        return jsonify({'error': 'Invalid chart_type. Supported: donut, bar, histogram, heatmap'}), 400

    return jsonify({
        'chart_type': chart_type,
        'image': img
    }), 200
