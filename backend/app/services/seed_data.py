"""
Sample Data and Category Seeding Service
Demonstrates:
- Safe database seeding with is_sample flags
- Default category creation with icons and theme colors
- Realistic multi-month financial timeline for MCA project demonstration
"""
from datetime import date, timedelta
from backend.app.database.db import db
from backend.app.models.category import Category
from backend.app.models.transaction import Transaction
from backend.app.models.budget import Budget

DEFAULT_CATEGORIES = [
    # Expenses
    {'name': 'Food & Dining', 'type': 'expense', 'icon': 'utensils', 'color': '#f97316', 'is_default': True},
    {'name': 'Transportation', 'type': 'expense', 'icon': 'bus', 'color': '#0284c7', 'is_default': True},
    {'name': 'Education & Books', 'type': 'expense', 'icon': 'graduation-cap', 'color': '#8b5cf6', 'is_default': True},
    {'name': 'Shopping & Tech', 'type': 'expense', 'icon': 'shopping-bag', 'color': '#ec4899', 'is_default': True},
    {'name': 'Rent & Housing', 'type': 'expense', 'icon': 'home', 'color': '#ef4444', 'is_default': True},
    {'name': 'Utility Bills', 'type': 'expense', 'icon': 'file-text', 'color': '#eab308', 'is_default': True},
    {'name': 'Healthcare', 'type': 'expense', 'icon': 'activity', 'color': '#14b8a6', 'is_default': True},
    {'name': 'Entertainment', 'type': 'expense', 'icon': 'film', 'color': '#a855f7', 'is_default': True},
    {'name': 'Travel & Outing', 'type': 'expense', 'icon': 'map-pin', 'color': '#f43f5e', 'is_default': True},
    {'name': 'Other Expense', 'type': 'expense', 'icon': 'more-horizontal', 'color': '#64748b', 'is_default': True},

    # Income
    {'name': 'Salary / Stipend', 'type': 'income', 'icon': 'briefcase', 'color': '#16a34a', 'is_default': True},
    {'name': 'Freelance Income', 'type': 'income', 'icon': 'laptop', 'color': '#059669', 'is_default': True},
    {'name': 'Scholarship', 'type': 'income', 'icon': 'award', 'color': '#10b981', 'is_default': True},
    {'name': 'Allowance / Gift', 'type': 'income', 'icon': 'gift', 'color': '#34d399', 'is_default': True},
]

def init_default_categories():
    """Seed initial categories if table is empty."""
    if Category.query.first() is None:
        for cat_data in DEFAULT_CATEGORIES:
            cat = Category(**cat_data)
            db.session.add(cat)
        db.session.commit()

def seed_sample_data():
    """
    Inserts realistic MCA student demonstration data.
    All sample transactions are flagged with `is_sample=True` for safe isolated deletion.
    """
    init_default_categories()

    # Clear existing sample data first to avoid duplicate seeds
    clear_sample_data()

    cats = {c.name: c.id for c in Category.query.all()}
    today = date.today()

    # Helper to calculate date offsets
    def get_date(days_ago: int) -> date:
        return today - timedelta(days=days_ago)

    sample_txs = [
        # Current Month (0-20 days ago)
        # Incomes
        {'description': 'MCA Research Internship Stipend', 'amount': 30000.0, 'type': 'income', 'category_id': cats.get('Salary / Stipend'), 'date': get_date(5), 'payment_method': 'Bank Transfer'},
        {'description': 'Python Flask Web Freelancing Project', 'amount': 15000.0, 'type': 'income', 'category_id': cats.get('Freelance Income'), 'date': get_date(12), 'payment_method': 'UPI'},
        {'description': 'Merit Academic Scholarship Credit', 'amount': 8000.0, 'type': 'income', 'category_id': cats.get('Scholarship'), 'date': get_date(18), 'payment_method': 'Net Banking'},

        # Expenses
        {'description': 'Hostel Room Monthly Rent', 'amount': 9500.0, 'type': 'expense', 'category_id': cats.get('Rent & Housing'), 'date': get_date(2), 'payment_method': 'UPI'},
        {'description': 'Campus Canteen & Mess Meal Card', 'amount': 4200.0, 'type': 'expense', 'category_id': cats.get('Food & Dining'), 'date': get_date(4), 'payment_method': 'UPI'},
        {'description': 'Data Science & Machine Learning Textbooks', 'amount': 2400.0, 'type': 'expense', 'category_id': cats.get('Education & Books'), 'date': get_date(7), 'payment_method': 'Debit Card'},
        {'description': 'Metro Smartcard Monthly Pass', 'amount': 1800.0, 'type': 'expense', 'category_id': cats.get('Transportation'), 'date': get_date(9), 'payment_method': 'UPI'},
        {'description': 'Wi-Fi Broadband 200Mbps Plan', 'amount': 899.0, 'type': 'expense', 'category_id': cats.get('Utility Bills'), 'date': get_date(11), 'payment_method': 'UPI'},
        {'description': 'Weekend Team Dinner & Cafe Swiggy', 'amount': 1450.0, 'type': 'expense', 'category_id': cats.get('Food & Dining'), 'date': get_date(13), 'payment_method': 'UPI'},
        {'description': 'Movie Tickets with College Batchmates', 'amount': 750.0, 'type': 'expense', 'category_id': cats.get('Entertainment'), 'date': get_date(15), 'payment_method': 'Credit Card'},
        {'description': 'External SSD 1TB for Dataset Backups', 'amount': 6500.0, 'type': 'expense', 'category_id': cats.get('Shopping & Tech'), 'date': get_date(16), 'payment_method': 'Credit Card'},
        {'description': 'Pharmacy Medicines & Health Checkup', 'amount': 1100.0, 'type': 'expense', 'category_id': cats.get('Healthcare'), 'date': get_date(17), 'payment_method': 'Cash'},

        # Previous Month (30-55 days ago)
        {'description': 'Monthly Internship Stipend', 'amount': 30000.0, 'type': 'income', 'category_id': cats.get('Salary / Stipend'), 'date': get_date(35), 'payment_method': 'Bank Transfer'},
        {'description': 'Freelance React Dashboard Build', 'amount': 12000.0, 'type': 'income', 'category_id': cats.get('Freelance Income'), 'date': get_date(42), 'payment_method': 'UPI'},
        {'description': 'Previous Month Hostel Rent', 'amount': 9500.0, 'type': 'expense', 'category_id': cats.get('Rent & Housing'), 'date': get_date(34), 'payment_method': 'UPI'},
        {'description': 'Mess Food & Groceries', 'amount': 4600.0, 'type': 'expense', 'category_id': cats.get('Food & Dining'), 'date': get_date(38), 'payment_method': 'UPI'},
        {'description': 'Python Certification Exam Registration', 'amount': 3500.0, 'type': 'expense', 'category_id': cats.get('Education & Books'), 'date': get_date(40), 'payment_method': 'Debit Card'},
        {'description': 'Local Cab & Metro Commute', 'amount': 1650.0, 'type': 'expense', 'category_id': cats.get('Transportation'), 'date': get_date(44), 'payment_method': 'Cash'},
        {'description': 'Electricity & Hostel Maintenance', 'amount': 1200.0, 'type': 'expense', 'category_id': cats.get('Utility Bills'), 'date': get_date(48), 'payment_method': 'UPI'},

        # Two Months Ago (65-85 days ago)
        {'description': 'Monthly Internship Stipend', 'amount': 30000.0, 'type': 'income', 'category_id': cats.get('Salary / Stipend'), 'date': get_date(65), 'payment_method': 'Bank Transfer'},
        {'description': 'Hostel Rent Payment', 'amount': 9500.0, 'type': 'expense', 'category_id': cats.get('Rent & Housing'), 'date': get_date(66), 'payment_method': 'UPI'},
        {'description': 'Dining & Snacks', 'amount': 3800.0, 'type': 'expense', 'category_id': cats.get('Food & Dining'), 'date': get_date(70), 'payment_method': 'UPI'},
        {'description': 'Semester Stationery & Lab Supplies', 'amount': 1500.0, 'type': 'expense', 'category_id': cats.get('Education & Books'), 'date': get_date(75), 'payment_method': 'Cash'},
    ]

    for item in sample_txs:
        if item['category_id'] is not None:
            tx = Transaction(
                description=item['description'],
                amount=item['amount'],
                type=item['type'],
                category_id=item['category_id'],
                date=item['date'],
                payment_method=item['payment_method'],
                is_sample=True,
                notes='Demonstration record for MCA project viva'
            )
            db.session.add(tx)

    # Seed Budgets for current month
    curr_month = today.strftime('%Y-%m')
    budgets_to_seed = [
        {'month_year': curr_month, 'category_id': None, 'amount': 35000.0},  # Overall Budget
        {'month_year': curr_month, 'category_id': cats.get('Food & Dining'), 'amount': 6000.0},
        {'month_year': curr_month, 'category_id': cats.get('Rent & Housing'), 'amount': 10000.0},
        {'month_year': curr_month, 'category_id': cats.get('Shopping & Tech'), 'amount': 7000.0},
        {'month_year': curr_month, 'category_id': cats.get('Transportation'), 'amount': 2500.0},
        {'month_year': curr_month, 'category_id': cats.get('Education & Books'), 'amount': 4000.0},
    ]

    for b in budgets_to_seed:
        existing = Budget.query.filter_by(month_year=b['month_year'], category_id=b['category_id']).first()
        if not existing:
            new_b = Budget(
                month_year=b['month_year'],
                category_id=b['category_id'],
                amount=b['amount']
            )
            db.session.add(new_b)

    db.session.commit()
    return len(sample_txs)

def clear_sample_data():
    """Safely deletes only records flagged with is_sample=True."""
    deleted_count = Transaction.query.filter_by(is_sample=True).delete()
    db.session.commit()
    return deleted_count
