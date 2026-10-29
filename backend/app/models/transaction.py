"""
Transaction Model
Demonstrates:
- ORM mapping with foreign keys and database indices
- Type annotations, data conversion, and formatting
- Safe decimal/numeric representations for monetary values
"""
from datetime import datetime, timezone, date
from backend.app.database.db import db

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False, index=True)
    amount = db.Column(db.Float, nullable=False)  # stored as 2-decimal rounded float
    type = db.Column(db.String(16), nullable=False, index=True)  # 'income' or 'expense'
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    payment_method = db.Column(db.String(32), nullable=False, default='UPI')  # 'Cash', 'UPI', 'Card', etc.
    notes = db.Column(db.Text, nullable=True)
    is_sample = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __init__(self, description='', amount=0.0, type='expense', category_id=None, date=None, payment_method='UPI', notes='', is_sample=False, **kwargs):
        super().__init__(**kwargs)
        self.description = description
        self.amount = amount
        self.type = type
        self.category_id = category_id
        self.date = date
        self.payment_method = payment_method
        self.notes = notes
        self.is_sample = is_sample

    def to_dict(self):
        """Convert transaction model instance to a JSON-serializable dictionary."""
        return {
            'id': self.id,
            'description': self.description,
            'amount': round(float(self.amount), 2),
            'type': self.type,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else 'Uncategorized',
            'category_color': self.category.color if self.category else '#94a3b8',
            'category_icon': self.category.icon if self.category else 'tag',
            'date': self.date.strftime('%Y-%m-%d') if isinstance(self.date, (date, datetime)) else str(self.date),
            'payment_method': self.payment_method,
            'notes': self.notes or '',
            'is_sample': self.is_sample,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<Transaction id={self.id} desc='{self.description}' amount={self.amount} type='{self.type}'>"
