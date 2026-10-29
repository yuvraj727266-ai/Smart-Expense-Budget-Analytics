"""
Budget Model
Demonstrates:
- Composite Unique Constraints in SQLAlchemy
- Handling Nullable Foreign Keys for hierarchical budgets (Overall vs Category)
- Data integrity validation
"""
from datetime import datetime, timezone
from backend.app.database.db import db

class Budget(db.Model):
    __tablename__ = 'budgets'
    __table_args__ = (
        # Ensure only one budget per category per month (or one overall budget per month)
        db.UniqueConstraint('month_year', 'category_id', name='uq_month_category_budget'),
    )

    id = db.Column(db.Integer, primary_key=True)
    month_year = db.Column(db.String(7), nullable=False, index=True)  # Format 'YYYY-MM'
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True, index=True)
    amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __init__(self, month_year='', category_id=None, amount=0.0, **kwargs):
        super().__init__(**kwargs)
        self.month_year = month_year
        self.category_id = category_id
        self.amount = amount

    def to_dict(self):
        """Convert budget record to dictionary."""
        return {
            'id': self.id,
            'month_year': self.month_year,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'Overall Budget',
            'category_color': self.category.color if self.category else '#059669',
            'category_icon': self.category.icon if self.category else 'wallet',
            'amount': round(float(self.amount), 2),
            'is_overall': self.category_id is None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        cat = self.category.name if self.category else "Overall"
        return f"<Budget id={self.id} month='{self.month_year}' category='{cat}' amount={self.amount}>"
