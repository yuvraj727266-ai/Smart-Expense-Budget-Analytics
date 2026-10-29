"""
Unit Tests for Pure Financial Calculation Functions
Testing syllabus algorithms:
- Summation and filtering
- Zero division protection
- Negative balances
- Floating point precision
"""
import pytest
from backend.app.services.financial_calculations import (
    calculate_total_income,
    calculate_total_expenses,
    calculate_net_savings,
    calculate_savings_rate,
    calculate_budget_remaining,
    calculate_budget_utilization,
    get_days_remaining_in_month
)

def test_calculate_totals_with_valid_data():
    transactions = [
        {'type': 'income', 'amount': 25000.0},
        {'type': 'income', 'amount': 15000.50},
        {'type': 'expense', 'amount': 5000.0},
        {'type': 'expense', 'amount': 1250.25},
    ]

    assert calculate_total_income(transactions) == 40000.50
    assert calculate_total_expenses(transactions) == 6250.25

def test_calculate_totals_with_empty_or_invalid():
    assert calculate_total_income([]) == 0.0
    assert calculate_total_expenses([]) == 0.0

    dirty = [
        {'type': 'income', 'amount': None},
        {'type': 'expense', 'amount': 'invalid'},
        {'type': 'other', 'amount': 1000}
    ]
    assert calculate_total_income(dirty) == 0.0
    assert calculate_total_expenses(dirty) == 0.0

def test_calculate_net_savings():
    assert calculate_net_savings(50000.0, 30000.0) == 20000.0
    # Deficit check
    assert calculate_net_savings(20000.0, 25000.0) == -5000.0
    # Zero checks
    assert calculate_net_savings(0.0, 0.0) == 0.0

def test_calculate_savings_rate_and_zero_division():
    # Regular case: 20000 savings out of 50000 income = 40%
    assert calculate_savings_rate(20000.0, 50000.0) == 40.0

    # Critical requirement: zero income must not raise ZeroDivisionError and return 0.0
    assert calculate_savings_rate(0.0, 0.0) == 0.0
    assert calculate_savings_rate(-500.0, 0.0) == 0.0
    assert calculate_savings_rate(100.0, -1000.0) == 0.0

def test_calculate_budget_remaining():
    # Budget 15000, Spent 12000 -> Remaining 3000
    assert calculate_budget_remaining(15000.0, 12000.0) == 3000.0
    # Over budget by 2000
    assert calculate_budget_remaining(10000.0, 12000.0) == -2000.0

def test_calculate_budget_utilization():
    # 5000 spent out of 10000 = 50%
    assert calculate_budget_utilization(5000.0, 10000.0) == 50.0
    # Over 100%
    assert calculate_budget_utilization(12000.0, 10000.0) == 120.0
    # Zero budget limit safety
    assert calculate_budget_utilization(500.0, 0.0) == 0.0

def test_get_days_remaining_in_month():
    days = get_days_remaining_in_month("2026-03-15")
    # March has 31 days. 31 - 15 = 16
    assert days == 16
