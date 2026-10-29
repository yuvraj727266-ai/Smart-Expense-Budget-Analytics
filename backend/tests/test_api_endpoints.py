"""
Integration and End-to-End API Tests
Testing:
- Transaction CRUD
- Validation rules and error responses
- Budget CRUD and limit checks
- CSV export and Formula Injection sanitization
"""
import pytest
import json

def test_health_check(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'

def test_transaction_crud_flow(client):
    # 1. Get categories
    cat_res = client.get('/api/categories')
    assert cat_res.status_code == 200
    categories = cat_res.get_json()
    food_id = categories[0]['id']

    # 2. Create transaction
    create_payload = {
        'description': 'Campus Lunch Thali',
        'amount': 180.0,
        'type': 'expense',
        'category_id': food_id,
        'date': '2026-03-10',
        'payment_method': 'UPI',
        'notes': 'Delicious meal'
    }
    post_res = client.post('/api/transactions', json=create_payload)
    assert post_res.status_code == 201
    created = post_res.get_json()
    tx_id = created['id']
    assert created['description'] == 'Campus Lunch Thali'
    assert created['amount'] == 180.0

    # 3. Read transaction
    get_res = client.get(f"/api/transactions/{tx_id}")
    assert get_res.status_code == 200
    assert get_res.get_json()['id'] == tx_id

    # 4. Update transaction
    put_res = client.put(f"/api/transactions/{tx_id}", json={'amount': 200.0, 'description': 'Special Thali'})
    assert put_res.status_code == 200
    assert put_res.get_json()['amount'] == 200.0

    # 5. Delete transaction
    del_res = client.delete(f"/api/transactions/{tx_id}")
    assert del_res.status_code == 200

    # Verify deleted
    verify_res = client.get(f"/api/transactions/{tx_id}")
    assert verify_res.status_code == 404

def test_invalid_transaction_payloads(client):
    # Missing description
    res = client.post('/api/transactions', json={'amount': 100, 'type': 'expense', 'date': '2026-03-01'})
    assert res.status_code == 400

    # Negative amount
    res = client.post('/api/transactions', json={'description': 'Test', 'amount': -50, 'type': 'expense', 'category_id': 1, 'date': '2026-03-01'})
    assert res.status_code == 400

    # Invalid type
    res = client.post('/api/transactions', json={'description': 'Test', 'amount': 100, 'type': 'invalid', 'category_id': 1, 'date': '2026-03-01'})
    assert res.status_code == 400

def test_budget_creation_and_duplicate_prevention(client):
    # Overall budget
    b1 = client.post('/api/budgets', json={'month_year': '2026-03', 'amount': 25000.0, 'category_id': None})
    assert b1.status_code == 201

    # Duplicate overall budget in same month should fail with 409
    b2 = client.post('/api/budgets', json={'month_year': '2026-03', 'amount': 30000.0, 'category_id': None})
    assert b2.status_code == 409

def test_csv_formula_injection_defense(client):
    # Add transaction with malicious formula payload (=CMD, @calc)
    cat_res = client.get('/api/categories')
    food_id = cat_res.get_json()[0]['id']

    payload = {
        'description': '=1+1;PAYLOAD',
        'amount': 500.0,
        'type': 'expense',
        'category_id': food_id,
        'date': '2026-03-10',
        'payment_method': 'UPI',
        'notes': '@calc.exe'
    }
    client.post('/api/transactions', json=payload)

    # Export CSV
    csv_res = client.get('/api/reports/transactions.csv')
    assert csv_res.status_code == 200
    csv_text = csv_res.data.decode('utf-8')

    # The formula characters MUST be prepended with a single apostrophe (') to neutralize execution
    assert "'=1+1;PAYLOAD" in csv_text
    assert "'@calc.exe" in csv_text
