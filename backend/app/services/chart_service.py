"""
Matplotlib & Seaborn Chart Service
Demonstrates:
- Non-interactive server-side plotting with matplotlib.use('Agg')
- Seaborn statistical plots (histograms, KDE, heatmaps)
- BytesIO in-memory image streaming to base64 PNG data URLs
- Beautiful academic styling with curated green/emerald color palette
"""
import io
import base64
import matplotlib
matplotlib.use('Agg')  # Thread-safe headless backend
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

from backend.app.services.analytics_service import AnalyticsService

# Configure Seaborn style for clean modern output
sns.set_theme(style="whitegrid", palette="pastel")
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 0.8


class ChartService:
    @staticmethod
    def _fig_to_base64(fig) -> str:
        """Converts Matplotlib figure to base64 encoded PNG string."""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=130)
        buf.seek(0)
        img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{img_b64}"

    @classmethod
    def generate_category_donut(cls, transactions: list, month_year=None) -> str:
        """Generate Matplotlib/Seaborn Donut Chart for Expense Categories."""
        df = AnalyticsService.transactions_to_dataframe(transactions)
        if df.empty or df[df['type'] == 'expense'].empty:
            return cls._create_empty_chart("No expense data available for Category Donut Chart")

        if month_year:
            df = df[df['month_year'] == month_year]

        exp_df = df[df['type'] == 'expense']
        if exp_df.empty:
            return cls._create_empty_chart("No expense records in selected period")

        cat_totals = exp_df.groupby('category_name')['amount'].sum().sort_values(ascending=False)

        fig, ax = plt.subplots(figsize=(7, 5))
        colors = sns.color_palette("Set2", len(cat_totals))

        wedges, texts, autotexts = ax.pie(
            cat_totals.values,
            labels=cat_totals.index,
            autopct='%1.1f%%',
            pctdistance=0.75,
            startangle=140,
            colors=colors,
            wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2)
        )
        for t in texts:
            t.set_fontsize(9)
            t.set_color('#1e293b')
        for at in autotexts:
            at.set_fontsize(8)
            at.set_color('#0f172a')
            at.set_weight('bold')

        title = f"Expense Breakdown by Category ({month_year})" if month_year else "Expense Breakdown by Category (All Time)"
        ax.set_title(title, fontsize=12, fontweight='bold', pad=15, color='#0f3f22')
        return cls._fig_to_base64(fig)

    @classmethod
    def generate_monthly_bar(cls, transactions: list) -> str:
        """Generate Monthly Income vs Expense Grouped Bar Chart."""
        monthly_data = AnalyticsService.get_monthly_comparison(transactions, last_n_months=6)
        if not monthly_data:
            return cls._create_empty_chart("No monthly records to display")

        m_df = pd.DataFrame(monthly_data)
        fig, ax = plt.subplots(figsize=(8, 4.5))

        x = np.arange(len(m_df))
        width = 0.35

        ax.bar(x - width/2, m_df['income'], width, label='Income', color='#2563eb', alpha=0.9, edgecolor='none')
        ax.bar(x + width/2, m_df['expense'], width, label='Expenses', color='#e11d48', alpha=0.9, edgecolor='none')

        ax.set_xlabel('Month', fontweight='bold', color='#334155', labelpad=8)
        ax.set_ylabel('Amount (₹)', fontweight='bold', color='#334155', labelpad=8)
        ax.set_title('Income vs. Expenses by Month (Pandas Aggregation)', fontsize=12, fontweight='bold', pad=12, color='#0f3f22')
        ax.set_xticks(x)
        ax.set_xticklabels(m_df['month_year'], rotation=20)
        ax.legend(frameon=True, facecolor='#f8fafc', edgecolor='#e2e8f0')

        return cls._fig_to_base64(fig)

    @classmethod
    def generate_histogram(cls, transactions: list) -> str:
        """Generate Expense Distribution Histogram with KDE using Seaborn."""
        df = AnalyticsService.transactions_to_dataframe(transactions)
        exp_df = df[df['type'] == 'expense'] if not df.empty else pd.DataFrame()
        if exp_df.empty or len(exp_df) < 2:
            return cls._create_empty_chart("Need at least 2 expense entries for distribution analysis")

        fig, ax = plt.subplots(figsize=(7.5, 4.5))
        sns.histplot(
            data=exp_df,
            x='amount',
            kde=True,
            color='#10b981',
            bins=max(5, min(15, len(exp_df))),
            ax=ax,
            edgecolor='#059669'
        )

        mean_val = exp_df['amount'].mean()
        median_val = exp_df['amount'].median()

        ax.axvline(mean_val, color='#2563eb', linestyle='--', linewidth=1.5, label=f"Mean: ₹{mean_val:.2f}")
        ax.axvline(median_val, color='#e11d48', linestyle=':', linewidth=1.5, label=f"Median: ₹{median_val:.2f}")

        ax.set_title('Expense Amount Distribution & Kernel Density Estimation (KDE)', fontsize=12, fontweight='bold', pad=12, color='#0f3f22')
        ax.set_xlabel('Transaction Amount (₹)', fontweight='bold', color='#334155')
        ax.set_ylabel('Frequency', fontweight='bold', color='#334155')
        ax.legend(frameon=True, facecolor='#f8fafc')

        return cls._fig_to_base64(fig)

    @classmethod
    def generate_correlation_heatmap(cls, transactions: list) -> str:
        """
        Generate Financial Correlation Heatmap using meaningful numerical & time features:
        - Amount
        - Day of Month
        - Day of Week (0-6)
        - Transaction Type encoded (1 for income, 0 for expense)
        """
        df = AnalyticsService.transactions_to_dataframe(transactions)
        if df.empty or len(df) < 3:
            return cls._create_empty_chart("Not enough data points for correlation matrix")

        # Prepare meaningful analytical features
        features = pd.DataFrame()
        features['Amount'] = df['amount']
        features['DayOfMonth'] = df['day_of_month']
        features['DayOfWeek'] = df['date'].dt.dayofweek
        features['IsIncome'] = (df['type'] == 'income').astype(int)

        corr = features.corr()

        fig, ax = plt.subplots(figsize=(6.5, 5))
        sns.heatmap(
            corr,
            annot=True,
            cmap='crest',
            vmin=-1,
            vmax=1,
            fmt='.2f',
            linewidths=0.75,
            cbar_kws={'shrink': 0.8},
            ax=ax
        )
        ax.set_title('Financial Features Correlation Matrix (NumPy/Seaborn)', fontsize=12, fontweight='bold', pad=12, color='#0f3f22')
        return cls._fig_to_base64(fig)

    @staticmethod
    def _create_empty_chart(message: str) -> str:
        """Generates a clean placeholder figure when insufficient data exists."""
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.text(0.5, 0.5, message, horizontalalignment='center', verticalalignment='center',
                fontsize=11, color='#64748b', style='italic', transform=ax.transAxes)
        ax.set_axis_off()
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{img_b64}"
