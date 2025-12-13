from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_add_sweet():
    response = client.post("/api/sweets", json={
        "name": "Gulab Jamun",
        "category": "Indian",
        "price": 50.0,
        "quantity": 100
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Gulab Jamun"
    assert data["quantity"] == 100

def test_add_sweet_missing_field():
    response = client.post("/api/sweets", json={
        "name": "Jalebi",
        "price": 40.0
    })
    assert response.status_code == 422  # validation error