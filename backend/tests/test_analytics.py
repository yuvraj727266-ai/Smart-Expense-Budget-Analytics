"""
Unit Tests for Pandas and NumPy Data Analytics Service
Testing syllabus concepts:
- DataFrame conversion and date parsing
- NumPy statistical computations (mean, median, std, IQR outliers)
- Category aggregations and MoM trends
"""
import pytest
from datetime import date
from backend.app.services.analytics_service import AnalyticsService

def test_dataframe_conversion_and_empty_handling():
    empty_df = AnalyticsService.transactions_to_dataframe([])
    assert empty_df.empty
    assert 'amount' in empty_df.columns
    assert 'date' in empty_df.columns

    sample_txs = [
        {'id': 1, 'description': 'Coffee', 'amount': 150.0, 'type': 'expense', 'category_name': 'Food', 'date': '2026-03-01', 'payment_method': 'UPI'},
        {'id': 2, 'description': 'Salary', 'amount': 30000.0, 'type': 'income', 'category_name': 'Salary', 'date': '2026-03-02', 'payment_method': 'Bank Transfer'}
    ]
    df = AnalyticsService.transactions_to_dataframe(sample_txs)
    assert len(df) == 2
    assert df['amount'].sum() == 30150.0
    assert 'month_year' in df.columns
    assert df['month_year'].iloc[0] == '2026-03'

def test_numpy_expense_statistics():
    sample_txs = [
        {'id': 1, 'amount': 100.0, 'type': 'expense', 'category_name': 'Food', 'date': '2026-03-01'},
        {'id': 2, 'amount': 200.0, 'type': 'expense', 'category_name': 'Food', 'date': '2026-03-02'},
        {'id': 3, 'amount': 300.0, 'type': 'expense', 'category_name': 'Travel', 'date': '2026-03-03'},
        {'id': 4, 'amount': 400.0, 'type': 'expense', 'category_name': 'Travel', 'date': '2026-03-04'},
        {'id': 5, 'amount': 5000.0, 'type': 'expense', 'category_name': 'Tech', 'date': '2026-03-05'},  # Obvious outlier
    ]

    stats = AnalyticsService.get_expense_statistics(sample_txs, month_year='2026-03')
    assert stats['count'] == 5
    assert stats['min'] == 100.0
    assert stats['max'] == 5000.0
    assert stats['median'] == 300.0
    assert stats['mean'] == 1200.0
    assert stats['std_dev'] > 0

    # IQR Outlier check: 5000 is an outlier
    outliers = AnalyticsService.detect_outlier_transactions(sample_txs)
    assert len(outliers) >= 1
    assert outliers[0]['amount'] == 5000.0

def test_category_breakdown():
    sample_txs = [
        {'id': 1, 'amount': 2000.0, 'type': 'expense', 'category_name': 'Food', 'date': '2026-03-01'},
        {'id': 2, 'amount': 3000.0, 'type': 'expense', 'category_name': 'Food', 'date': '2026-03-05'},
        {'id': 3, 'amount': 5000.0, 'type': 'expense', 'category_name': 'Rent', 'date': '2026-03-02'},
    ]
    breakdown = AnalyticsService.get_category_breakdown(sample_txs, month_year='2026-03')
    assert len(breakdown) == 2
    # Rent and Food are both 5000 (50% each)
    assert breakdown[0]['total_amount'] == 5000.0
    assert breakdown[0]['percentage'] == 50.0

def test_monthly_comparison():
    sample_txs = [
        {'id': 1, 'amount': 20000.0, 'type': 'income', 'category_name': 'Salary', 'date': '2026-01-01'},
        {'id': 2, 'amount': 10000.0, 'type': 'expense', 'category_name': 'Rent', 'date': '2026-01-05'},
        {'id': 3, 'amount': 25000.0, 'type': 'income', 'category_name': 'Salary', 'date': '2026-02-01'},
        {'id': 4, 'amount': 15000.0, 'type': 'expense', 'category_name': 'Rent', 'date': '2026-02-05'},
    ]
    comparison = AnalyticsService.get_monthly_comparison(sample_txs)
    assert len(comparison) == 2
    assert comparison[0]['month_year'] == '2026-01'
    assert comparison[0]['savings'] == 10000.0
    assert comparison[1]['month_year'] == '2026-02'
    assert comparison[1]['savings'] == 10000.0
    # Month 2 vs Month 1: 15000 vs 10000 = +50% increase
    assert comparison[1]['mom_expense_change'] == 50.0
