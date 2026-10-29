"""
Core Financial Calculations Service
Direct Syllabus Mapping:
- Chapter 1.1: Operators, data types, float rounding
- Chapter 1.2: Conditional statements (if-elif-else, zero-division guards)
- Chapter 1.3: List comprehensions and sequences
- Chapter 1.4: Pure functions, default arguments, return values

Calculations strictly follow financial rules:
- Total Income = Sum of income transactions
- Total Expenses = Sum of expense transactions
- Net Savings = Total Income - Total Expenses
- Savings Rate = (Net Savings / Total Income) * 100 (when Total Income > 0)
- Budget Remaining = Budget Limit - Actual Expenses
- Budget Utilization = (Actual Expenses / Budget Limit) * 100 (when Budget Limit > 0)
"""
import calendar
from datetime import datetime, date
from typing import List, Dict, Any, Union

def calculate_total_income(transactions: List[Union[Dict[str, Any], Any]]) -> float:
    """
    Calculate the sum of all income transactions using Python list comprehension.
    Handles both dictionary representations and SQLAlchemy model objects.
    """
    if not transactions:
        return 0.0

    total = 0.0
    for t in transactions:
        # Dictionary or object attribute access
        t_type = t.get('type') if isinstance(t, dict) else getattr(t, 'type', None)
        t_amount = t.get('amount') if isinstance(t, dict) else getattr(t, 'amount', 0.0)

        if t_type == 'income' and t_amount:
            try:
                total += float(t_amount)
            except (ValueError, TypeError):
                continue

    return round(total, 2)


def calculate_total_expenses(transactions: List[Union[Dict[str, Any], Any]]) -> float:
    """
    Calculate the sum of all expense transactions using Python list comprehension.
    """
    if not transactions:
        return 0.0

    total = 0.0
    for t in transactions:
        t_type = t.get('type') if isinstance(t, dict) else getattr(t, 'type', None)
        t_amount = t.get('amount') if isinstance(t, dict) else getattr(t, 'amount', 0.0)

        if t_type == 'expense' and t_amount:
            try:
                total += float(t_amount)
            except (ValueError, TypeError):
                continue

    return round(total, 2)


def calculate_net_savings(total_income: float, total_expenses: float) -> float:
    """
    Net Savings = Total Income - Total Expenses.
    Can be negative if user is operating at a deficit.
    """
    try:
        income = float(total_income or 0.0)
        expenses = float(total_expenses or 0.0)
        return round(income - expenses, 2)
    except (ValueError, TypeError):
        return 0.0


def calculate_savings_rate(net_savings: float, total_income: float) -> float:
    """
    Savings Rate = (Net Savings / Total Income) * 100.
    Safely handles zero or negative total income to prevent ZeroDivisionError.
    """
    try:
        income = float(total_income or 0.0)
        savings = float(net_savings or 0.0)

        if income <= 0:
            return 0.0

        rate = (savings / income) * 100.0
        return round(rate, 2)
    except (ValueError, TypeError, ZeroDivisionError):
        return 0.0


def calculate_budget_remaining(budget_limit: float, actual_expenses: float) -> float:
    """
    Budget Remaining = Budget Limit - Actual Expenses.
    Clearly distinguishes remaining budget from actual savings.
    """
    try:
        limit = float(budget_limit or 0.0)
        spent = float(actual_expenses or 0.0)
        return round(limit - spent, 2)
    except (ValueError, TypeError):
        return 0.0


def calculate_budget_utilization(actual_expenses: float, budget_limit: float) -> float:
    """
    Budget Utilization Percentage = (Actual Expenses / Budget Limit) * 100.
    Returns 0.0 if budget_limit <= 0.
    """
    try:
        limit = float(budget_limit or 0.0)
        spent = float(actual_expenses or 0.0)

        if limit <= 0:
            return 0.0

        utilization = (spent / limit) * 100.0
        return round(utilization, 2)
    except (ValueError, TypeError, ZeroDivisionError):
        return 0.0


def get_days_remaining_in_month(ref_date: Union[date, datetime, str] = None) -> int:
    """
    Calculate number of days remaining in the specified or current month.
    """
    if ref_date is None:
        target = date.today()
    elif isinstance(ref_date, str):
        try:
            target = datetime.strptime(ref_date[:10], '%Y-%m-%d').date()
        except ValueError:
            target = date.today()
    elif isinstance(ref_date, datetime):
        target = ref_date.date()
    else:
        target = ref_date

    days_in_month = calendar.monthrange(target.year, target.month)[1]
    remaining = days_in_month - target.day
    return max(0, remaining)
