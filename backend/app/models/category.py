"""
Category Model
Demonstrates:
- SQLAlchemy ORM Model Mapping
- Python Classes, Encapsulation, and Methods
- Default arguments and timestamps
"""
from datetime import datetime, timezone
from backend.app.database.db import db

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False, default='expense')  # 'expense', 'income', 'both'
    icon = db.Column(db.String(32), default='tag')
    color = db.Column(db.String(16), default='#10b981')
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    transactions = db.relationship('Transaction', backref='category', lazy=True)
    budgets = db.relationship('Budget', backref='category', lazy=True)

    def __init__(self, name='', type='expense', icon='tag', color='#10b981', is_default=False, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.type = type
        self.icon = icon
        self.color = color
        self.is_default = is_default

    def to_dict(self):
        """Serializes category object to Python dictionary for JSON responses."""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'icon': self.icon,
            'color': self.color,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'transaction_count': len(self.transactions) if self.transactions else 0
        }

    def __repr__(self):
        return f"<Category id={self.id} name='{self.name}' type='{self.type}'>"
