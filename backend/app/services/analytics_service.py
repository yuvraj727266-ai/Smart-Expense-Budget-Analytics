"""
Pandas and NumPy Data Analytics Service
Direct Syllabus Mapping:
- Unit 2 (Data Analytics):
  * NumPy ndarrays, vectorized operations, np.percentile, np.std, np.mean, np.median
  * Pandas Series & DataFrames, groupby, pivot, resample, date parsing, missing value imputation
  * Statistical outlier detection (IQR rule)
  * Month-over-month percentage changes and end-of-month forecasting
"""
import calendar
from datetime import datetime, date
from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd

from backend.app.services.financial_calculations import (
    calculate_net_savings,
    calculate_savings_rate,
    calculate_budget_remaining,
    calculate_budget_utilization,
    get_days_remaining_in_month
)

class AnalyticsService:
    """
    Encapsulates advanced financial analytics using NumPy and Pandas.
    Follows OOP principles (Unit 2) with clean separation of analytical algorithms.
    """

    @staticmethod
    def transactions_to_dataframe(transactions: List[Any]) -> pd.DataFrame:
        """
        Convert a list of Transaction models or dictionaries into a Pandas DataFrame.
        Applies data cleaning, type conversions, and missing-value handling.
        """
        if not transactions:
            return pd.DataFrame(columns=[
                'id', 'description', 'amount', 'type', 'category_id',
                'category_name', 'category_color', 'date', 'payment_method',
                'month_year', 'day_of_month', 'day_of_week'
            ])

        data = []
        for t in transactions:
            if isinstance(t, dict):
                row = t.copy()
            else:
                row = t.to_dict()
            data.append(row)

        df = pd.DataFrame(data)

        # Ensure essential columns exist
        for col in ['id', 'description', 'amount', 'type', 'category_name', 'date', 'payment_method']:
            if col not in df.columns:
                df[col] = None

        # Clean amount using pandas & numpy
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)

        # Parse date column safely
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        # Drop rows where date could not be parsed
        df = df.dropna(subset=['date'])

        # Derive analytical time features
        df['month_year'] = df['date'].dt.strftime('%Y-%m-%d').str.slice(0, 7)
        df['day_of_month'] = df['date'].dt.day
        df['day_of_week'] = df['date'].dt.day_name()
        df['category_name'] = df['category_name'].fillna('Uncategorized')
        df['type'] = df['type'].fillna('expense')

        return df

    @classmethod
    def get_dashboard_summary(cls, transactions: List[Any], current_month: Optional[str] = None, overall_budget: float = 0.0) -> Dict[str, Any]:
        """
        Computes high-level dashboard metrics using NumPy & Pandas.
        Calculates income, expense, savings, savings rate, and budget remaining for the active month.
        """
        if not current_month:
            current_month = datetime.now().strftime('%Y-%m')

        df = cls.transactions_to_dataframe(transactions)

        # All-time totals
        all_income = float(df[df['type'] == 'income']['amount'].sum()) if not df.empty else 0.0
        all_expenses = float(df[df['type'] == 'expense']['amount'].sum()) if not df.empty else 0.0
        all_savings = calculate_net_savings(all_income, all_expenses)
        all_savings_rate = calculate_savings_rate(all_savings, all_income)

        # Current month filtering using Pandas query
        if not df.empty:
            m_df = df[df['month_year'] == current_month]
            m_income = float(m_df[m_df['type'] == 'income']['amount'].sum())
            m_expenses = float(m_df[m_df['type'] == 'expense']['amount'].sum())
        else:
            m_income = 0.0
            m_expenses = 0.0

        m_savings = calculate_net_savings(m_income, m_expenses)
        m_savings_rate = calculate_savings_rate(m_savings, m_income)
        m_budget_remaining = calculate_budget_remaining(overall_budget, m_expenses)
        m_budget_utilization = calculate_budget_utilization(m_expenses, overall_budget)

        # Days remaining in current month
        days_remaining = get_days_remaining_in_month(f"{current_month}-01")

        return {
            'current_month': current_month,
            'monthly_income': round(m_income, 2),
            'monthly_expenses': round(m_expenses, 2),
            'monthly_savings': round(m_savings, 2),
            'monthly_savings_rate': round(m_savings_rate, 2),
            'monthly_budget': round(overall_budget, 2),
            'budget_remaining': round(m_budget_remaining, 2),
            'budget_utilization': round(m_budget_utilization, 2),
            'days_remaining_in_month': days_remaining,
            'all_time': {
                'total_income': round(all_income, 2),
                'total_expenses': round(all_expenses, 2),
                'net_savings': round(all_savings, 2),
                'savings_rate': round(all_savings_rate, 2),
                'total_transactions': len(df)
            }
        }

    @classmethod
    def get_expense_statistics(cls, transactions: List[Any], month_year: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes NumPy array-based statistical computations:
        Mean, median, min, max, standard deviation (variability), and IQR outlier thresholds.
        """
        df = cls.transactions_to_dataframe(transactions)

        if not df.empty and month_year:
            df = df[df['month_year'] == month_year]

        exp_df = df[df['type'] == 'expense'] if not df.empty else pd.DataFrame()

        if exp_df.empty or len(exp_df) == 0:
            return {
                'total_expense': 0.0,
                'count': 0,
                'mean': 0.0,
                'median': 0.0,
                'std_dev': 0.0,
                'min': 0.0,
                'max': 0.0,
                'q1': 0.0,
                'q3': 0.0,
                'iqr': 0.0,
                'outlier_threshold': 0.0,
                'outliers_count': 0,
                'average_daily_spending': 0.0,
                'projected_monthly_spending': 0.0
            }

        # Extract NumPy array for high-performance statistical vector calculations
        amounts = exp_df['amount'].to_numpy(dtype=np.float64)

        mean_val = float(np.mean(amounts))
        median_val = float(np.median(amounts))
        std_val = float(np.std(amounts, ddof=0))  # Standard deviation
        min_val = float(np.min(amounts))
        max_val = float(np.max(amounts))

        # IQR statistical rule for outliers
        # Q1 = 25th percentile, Q3 = 75th percentile
        q1 = float(np.percentile(amounts, 25))
        q3 = float(np.percentile(amounts, 75))
        iqr = q3 - q1
        outlier_threshold = q3 + (1.5 * iqr)

        outliers = amounts[amounts > outlier_threshold]
        outliers_count = int(len(outliers))

        # Average daily spending and forecast
        total_exp = float(np.sum(amounts))

        # Determine elapsed days
        now = datetime.now()
        if month_year and month_year == now.strftime('%Y-%m'):
            current_day = max(1, now.day)
            days_in_month = calendar.monthrange(now.year, now.month)[1]
        elif month_year:
            y, m = map(int, month_year.split('-'))
            days_in_month = calendar.monthrange(y, m)[1]
            current_day = days_in_month
        else:
            current_day = max(1, now.day)
            days_in_month = calendar.monthrange(now.year, now.month)[1]

        avg_daily = total_exp / current_day
        projected = avg_daily * days_in_month

        return {
            'total_expense': round(total_exp, 2),
            'count': int(len(amounts)),
            'mean': round(mean_val, 2),
            'median': round(median_val, 2),
            'std_dev': round(std_val, 2),
            'min': round(min_val, 2),
            'max': round(max_val, 2),
            'q1': round(q1, 2),
            'q3': round(q3, 2),
            'iqr': round(iqr, 2),
            'outlier_threshold': round(outlier_threshold, 2),
            'outliers_count': outliers_count,
            'average_daily_spending': round(avg_daily, 2),
            'projected_monthly_spending': round(projected, 2),
            'projection_assumption': f"Assumes spending velocity of ₹{round(avg_daily, 2)}/day holds across all {days_in_month} days of the month."
        }

    @classmethod
    def get_category_breakdown(cls, transactions: List[Any], month_year: Optional[str] = None, transaction_type: str = 'expense') -> List[Dict[str, Any]]:
        """
        Uses Pandas groupby and aggregation to compute category totals,
        percentage share, transaction counts, and averages.
        """
        df = cls.transactions_to_dataframe(transactions)

        if df.empty:
            return []

        if month_year:
            df = df[df['month_year'] == month_year]

        if transaction_type in ['expense', 'income']:
            df = df[df['type'] == transaction_type]

        if df.empty:
            return []

        # Group by category
        grouped = df.groupby(['category_name']).agg(
            total_amount=('amount', 'sum'),
            count=('id', 'count'),
            avg_amount=('amount', 'mean'),
            max_amount=('amount', 'max')
        ).reset_index()

        total_sum = float(grouped['total_amount'].sum())

        results = []
        for _, row in grouped.iterrows():
            cat_total = float(row['total_amount'])
            pct = (cat_total / total_sum * 100.0) if total_sum > 0 else 0.0

            # Match category color/icon if available from original df
            cat_subset = df[df['category_name'] == row['category_name']]
            color = cat_subset['category_color'].iloc[0] if 'category_color' in cat_subset.columns and not cat_subset.empty else '#10b981'
            icon = cat_subset['category_icon'].iloc[0] if 'category_icon' in cat_subset.columns and not cat_subset.empty else 'tag'

            results.append({
                'category_name': row['category_name'],
                'total_amount': round(cat_total, 2),
                'transaction_count': int(row['count']),
                'average_amount': round(float(row['avg_amount']), 2),
                'max_amount': round(float(row['max_amount']), 2),
                'percentage': round(pct, 2),
                'color': color or '#10b981',
                'icon': icon or 'tag'
            })

        # Sort descending by total_amount
        results.sort(key=lambda x: x['total_amount'], reverse=True)
        return results

    @classmethod
    def get_monthly_comparison(cls, transactions: List[Any], last_n_months: int = 6) -> List[Dict[str, Any]]:
        """
        Aggregates financial records by month using Pandas.
        Calculates Income vs Expenses, Net Savings, Savings Rate, and Month-over-Month percentage changes.
        """
        df = cls.transactions_to_dataframe(transactions)

        if df.empty:
            return []

        # Group by month_year and type
        pivot = df.pivot_table(
            index='month_year',
            columns='type',
            values='amount',
            aggfunc='sum',
            fill_value=0.0
        ).reset_index()

        if 'income' not in pivot.columns:
            pivot['income'] = 0.0
        if 'expense' not in pivot.columns:
            pivot['expense'] = 0.0

        # Sort chronologically
        pivot = pivot.sort_values('month_year')
        if len(pivot) > last_n_months:
            pivot = pivot.tail(last_n_months)

        monthly_records = []
        prev_expense = None
        prev_income = None

        for _, row in pivot.iterrows():
            m_year = row['month_year']
            inc = float(row['income'])
            exp = float(row['expense'])
            sav = calculate_net_savings(inc, exp)
            rate = calculate_savings_rate(sav, inc)

            # Month-over-month calculation using NumPy/pure math
            if prev_expense is not None and prev_expense > 0:
                mom_exp_change = ((exp - prev_expense) / prev_expense) * 100.0
            else:
                mom_exp_change = 0.0

            if prev_income is not None and prev_income > 0:
                mom_inc_change = ((inc - prev_income) / prev_income) * 100.0
            else:
                mom_inc_change = 0.0

            monthly_records.append({
                'month_year': m_year,
                'income': round(inc, 2),
                'expense': round(exp, 2),
                'savings': round(sav, 2),
                'savings_rate': round(rate, 2),
                'mom_expense_change': round(mom_exp_change, 2),
                'mom_income_change': round(mom_inc_change, 2)
            })

            prev_expense = exp
            prev_income = inc

        return monthly_records

    @classmethod
    def get_daily_spending_trend(cls, transactions: List[Any], month_year: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Computes day-by-day expense timeline for interactive trend charts.
        """
        df = cls.transactions_to_dataframe(transactions)

        if df.empty:
            return []

        if month_year:
            df = df[df['month_year'] == month_year]

        exp_df = df[df['type'] == 'expense']
        if exp_df.empty:
            return []

        # Group by formatted date string
        daily = exp_df.groupby(exp_df['date'].dt.strftime('%Y-%m-%d')).agg(
            amount=('amount', 'sum'),
            count=('id', 'count')
        ).reset_index()

        daily = daily.sort_values('date')

        return [
            {
                'date': row['date'],
                'amount': round(float(row['amount']), 2),
                'count': int(row['count'])
            }
            for _, row in daily.iterrows()
        ]

    @classmethod
    def detect_outlier_transactions(cls, transactions: List[Any]) -> List[Dict[str, Any]]:
        """
        Uses the Interquartile Range (IQR) rule to detect unusually large transactions.
        Documented statistical method:
        Threshold = Q3 + (1.5 * IQR)
        Flagged as potential statistical outliers for student viva demonstration.
        """
        df = cls.transactions_to_dataframe(transactions)

        if df.empty:
            return []

        exp_df = df[df['type'] == 'expense']
        if len(exp_df) < 4:
            # Not enough data points to compute meaningful quartiles
            return []

        amounts = exp_df['amount'].to_numpy(dtype=np.float64)
        q1 = float(np.percentile(amounts, 25))
        q3 = float(np.percentile(amounts, 75))
        iqr = q3 - q1
        threshold = q3 + (1.5 * iqr)

        outlier_df = exp_df[exp_df['amount'] > threshold]

        results = []
        for _, row in outlier_df.iterrows():
            results.append({
                'id': int(row['id']) if pd.notnull(row['id']) else None,
                'description': row['description'],
                'amount': round(float(row['amount']), 2),
                'category_name': row['category_name'],
                'date': row['date'].strftime('%Y-%m-%d') if pd.notnull(row['date']) else '',
                'threshold': round(threshold, 2),
                'reason': f"Amount ₹{round(float(row['amount']), 2)} exceeds IQR statistical upper fence (₹{round(threshold, 2)})"
            })

        return sorted(results, key=lambda x: x['amount'], reverse=True)
