"""
Smart Rule-Based Financial Insight Engine
Demonstrates:
- Dynamic data-driven rule evaluation using Python
- Conditionals, dictionaries, list processing
- Statistical outlier flags and budget threshold warnings
"""
from datetime import datetime
from typing import List, Dict, Any, Optional

from backend.app.services.analytics_service import AnalyticsService

class InsightEngine:
    @classmethod
    def generate_insights(
        cls,
        transactions: List[Any],
        budgets: List[Any] = None,
        month_year: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dynamically analyzes transaction data and budget limits to produce
        personalized, actionable financial insights.
        """
        if not month_year:
            month_year = datetime.now().strftime('%Y-%m')

        insights = []
        df = AnalyticsService.transactions_to_dataframe(transactions)

        if df.empty:
            return {
                'month_year': month_year,
                'total_insights': 0,
                'disclaimer': "This system provides educational and analytical summaries. It does not provide certified financial, tax, or investment advice.",
                'items': [{
                    'id': 'empty_data',
                    'type': 'info',
                    'title': 'No Transactions Yet',
                    'message': 'Record your first income or expense transaction to unlock data analytics and smart insights.',
                    'metric': '₹0.00'
                }]
            }

        # 1. Monthly Comparison & MoM Trends
        monthly_trends = AnalyticsService.get_monthly_comparison(transactions, last_n_months=3)
        if len(monthly_trends) >= 2:
            latest = monthly_trends[-1]
            prev = monthly_trends[-2]

            # MoM Expense Change
            if prev['expense'] > 0:
                mom_diff = ((latest['expense'] - prev['expense']) / prev['expense']) * 100.0
                if mom_diff > 15:
                    insights.append({
                        'id': 'mom_expense_rise',
                        'type': 'warning',
                        'title': 'Significant Expense Increase',
                        'message': f"Your overall expenses increased by {abs(mom_diff):.1f}% compared with last month (from ₹{prev['expense']:,.2f} to ₹{latest['expense']:,.2f}).",
                        'metric': f"+{abs(mom_diff):.1f}%"
                    })
                elif mom_diff < -10:
                    insights.append({
                        'id': 'mom_expense_drop',
                        'type': 'success',
                        'title': 'Great Expense Reduction',
                        'message': f"Excellent discipline! Your expenses decreased by {abs(mom_diff):.1f}% compared to last month.",
                        'metric': f"-{abs(mom_diff):.1f}%"
                    })

            # Savings Growth
            if latest['savings'] > prev['savings'] and latest['savings'] > 0:
                diff_savings = latest['savings'] - prev['savings']
                insights.append({
                    'id': 'savings_growth',
                    'type': 'success',
                    'title': 'Net Savings Improved',
                    'message': f"Your net savings increased by ₹{diff_savings:,.2f} compared with the previous month.",
                    'metric': f"+₹{diff_savings:,.2f}"
                })
        else:
            insights.append({
                'id': 'insufficient_history',
                'type': 'info',
                'title': 'Building Historical Baseline',
                'message': 'Record transactions across multiple consecutive months to activate Month-over-Month trend analytics.',
                'metric': '1 Month Logged'
            })

        # 2. Daily Velocity and Projections
        stats = AnalyticsService.get_expense_statistics(transactions, month_year=month_year)
        if stats['count'] > 0:
            avg_daily = stats['average_daily_spending']
            insights.append({
                'id': 'daily_burn_rate',
                'type': 'neutral',
                'title': 'Daily Spending Velocity',
                'message': f"Your average daily spending for {month_year} is ₹{avg_daily:,.2f} across {stats['count']} recorded expenses.",
                'metric': f"₹{avg_daily:,.2f} / day"
            })

        # 3. Top Spending Category
        categories = AnalyticsService.get_category_breakdown(transactions, month_year=month_year, transaction_type='expense')
        if categories:
            top_cat = categories[0]
            insights.append({
                'id': 'top_category',
                'type': 'info',
                'title': f"Highest Expense Category: {top_cat['category_name']}",
                'message': f"{top_cat['category_name']} represents {top_cat['percentage']:.1f}% of your total expenses this month (₹{top_cat['total_amount']:,.2f}).",
                'metric': f"{top_cat['percentage']:.1f}%"
            })

        # 4. Budget Utilization Rules & Warnings
        if budgets:
            # Map budgets
            for b in budgets:
                b_dict = b.to_dict() if hasattr(b, 'to_dict') else b
                if b_dict.get('month_year') == month_year:
                    b_amount = float(b_dict.get('amount', 0))
                    cat_name = b_dict.get('category_name', 'Overall')
                    is_overall = b_dict.get('is_overall', False)

                    # Calculate actual spent in this category
                    if is_overall:
                        spent = float(stats.get('total_expense', 0))
                    else:
                        cat_item = next((c for c in categories if c['category_name'].lower() == cat_name.lower()), None)
                        spent = cat_item['total_amount'] if cat_item else 0.0

                    utilization = (spent / b_amount * 100.0) if b_amount > 0 else 0.0

                    if utilization >= 100.0:
                        over_by = spent - b_amount
                        insights.append({
                            'id': f"budget_exceeded_{cat_name}",
                            'type': 'danger',
                            'title': f"Budget Exceeded: {cat_name}",
                            'message': f"You have exceeded your {cat_name} budget limit of ₹{b_amount:,.2f} by ₹{over_by:,.2f} ({utilization:.1f}% used).",
                            'metric': f"{utilization:.1f}%"
                        })
                    elif utilization >= 80.0:
                        remaining = b_amount - spent
                        insights.append({
                            'id': f"budget_warning_{cat_name}",
                            'type': 'warning',
                            'title': f"Budget Alert: {cat_name} at {utilization:.1f}%",
                            'message': f"Caution: You have utilized {utilization:.1f}% of your {cat_name} budget. Only ₹{remaining:,.2f} remains.",
                            'metric': f"₹{remaining:,.2f} left"
                        })

        # 5. Statistical Outlier Detection (IQR Rule)
        outliers = AnalyticsService.detect_outlier_transactions(transactions)
        if outliers:
            top_outlier = outliers[0]
            insights.append({
                'id': 'statistical_outlier',
                'type': 'warning',
                'title': 'Unusual High Expense Flagged',
                'message': f"Transaction '{top_outlier['description']}' (₹{top_outlier['amount']:,.2f}) on {top_outlier['date']} exceeded the statistical IQR upper threshold (₹{top_outlier['threshold']:,.2f}).",
                'metric': f"₹{top_outlier['amount']:,.2f}"
            })

        return {
            'month_year': month_year,
            'total_insights': len(insights),
            'disclaimer': "This system provides educational and analytical summaries. It does not provide certified financial, tax, or investment advice.",
            'items': insights
        }
