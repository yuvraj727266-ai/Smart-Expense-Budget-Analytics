"""
Reports and Data Export API Blueprint
Demonstrates:
- CSV streaming using Python io and csv modules
- Protection against CSV / Formula Injection attacks (CWE-1236)
- Comprehensive financial statement reporting
"""
import io
import csv
from datetime import datetime
from flask import Blueprint, request, Response, jsonify
from backend.app.models.transaction import Transaction
from backend.app.services.analytics_service import AnalyticsService

reports_bp = Blueprint('reports', __name__)

def sanitize_csv_cell(value: any) -> str:
    """
    Prevents Spreadsheet Formula Injection (CSV Injection / CWE-1236).
    If a cell starts with =, +, -, @, tab, or carriage return,
    prefix it with an apostrophe (') so spreadsheet software treats it as plain text.
    """
    if value is None:
        return ""
    str_val = str(value)
    if str_val and str_val[0] in ('=', '+', '-', '@', '\t', '\r'):
        return f"'{str_val}"
    return str_val


@reports_bp.route('/api/reports/transactions.csv', methods=['GET'])
def export_transactions_csv():
    query = Transaction.query

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    tx_type = request.args.get('type')
    category_id = request.args.get('category_id', type=int)

    if start_date:
        try:
            query = query.filter(Transaction.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        except ValueError:
            pass
    if end_date:
        try:
            query = query.filter(Transaction.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
        except ValueError:
            pass
    if tx_type:
        query = query.filter(Transaction.type == tx_type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)

    transactions = query.order_by(Transaction.date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(['Transaction ID', 'Date', 'Description', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Notes'])

    for t in transactions:
        writer.writerow([
            t.id,
            t.date.strftime('%Y-%m-%d'),
            sanitize_csv_cell(t.description),
            t.type.capitalize(),
            sanitize_csv_cell(t.category.name if t.category else 'Uncategorized'),
            f"{t.amount:.2f}",
            sanitize_csv_cell(t.payment_method),
            sanitize_csv_cell(t.notes or '')
        ])

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=transactions_report.csv'}
    )


@reports_bp.route('/api/reports/summary.csv', methods=['GET'])
def export_summary_csv():
    all_txs = Transaction.query.all()
    monthly_data = AnalyticsService.get_monthly_comparison(all_txs, last_n_months=12)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(['Month', 'Income (INR)', 'Expenses (INR)', 'Net Savings (INR)', 'Savings Rate (%)', 'MoM Expense Change (%)'])

    for row in monthly_data:
        writer.writerow([
            row['month_year'],
            f"{row['income']:.2f}",
            f"{row['expense']:.2f}",
            f"{row['savings']:.2f}",
            f"{row['savings_rate']:.2f}%",
            f"{row['mom_expense_change']:.2f}%"
        ])

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=monthly_financial_summary.csv'}
    )


@reports_bp.route('/api/reports/categories.csv', methods=['GET'])
def export_categories_csv():
    month_year = request.args.get('month_year')
    all_txs = Transaction.query.all()
    cats = AnalyticsService.get_category_breakdown(all_txs, month_year=month_year, transaction_type='expense')

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(['Category Name', 'Total Amount (INR)', 'Transaction Count', 'Average Amount (INR)', 'Share (%)'])

    for c in cats:
        writer.writerow([
            sanitize_csv_cell(c['category_name']),
            f"{c['total_amount']:.2f}",
            c['transaction_count'],
            f"{c['average_amount']:.2f}",
            f"{c['percentage']:.2f}%"
        ])

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=category_breakdown_report.csv'}
    )


@reports_bp.route('/api/reports/financial-statement', methods=['GET'])
def get_financial_statement():
    """Returns aggregated JSON payload for interactive printable reports."""
    month_year = request.args.get('month_year')
    if not month_year:
        month_year = datetime.now().strftime('%Y-%m')

    all_txs = Transaction.query.all()
    summary = AnalyticsService.get_dashboard_summary(all_txs, current_month=month_year)
    cats = AnalyticsService.get_category_breakdown(all_txs, month_year=month_year, transaction_type='expense')
    stats = AnalyticsService.get_expense_statistics(all_txs, month_year=month_year)

    # Top spending transactions this month
    df = AnalyticsService.transactions_to_dataframe(all_txs)
    top_txs = []
    if not df.empty:
        m_df = df[(df['month_year'] == month_year) & (df['type'] == 'expense')]
        if not m_df.empty:
            sorted_m = m_df.sort_values('amount', ascending=False).head(5)
            for _, r in sorted_m.iterrows():
                top_txs.append({
                    'description': r['description'],
                    'category_name': r['category_name'],
                    'amount': round(float(r['amount']), 2),
                    'date': r['date'].strftime('%Y-%m-%d')
                })

    return jsonify({
        'month_year': month_year,
        'summary': summary,
        'categories': cats,
        'statistics': stats,
        'top_transactions': top_txs
    }), 200
