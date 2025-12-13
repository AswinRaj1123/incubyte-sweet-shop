from fastapi.testclient import TestClient
from backend.main import app
from backend.routes.auth import get_current_user

def fake_current_user():
    return {"email": "test@example.com", "role": "user"}

app.dependency_overrides[get_current_user] = fake_current_user

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
    assert response.status_code == 422

def test_list_sweets():
    client.post("/api/sweets", json={
        "name": "Rasgulla",
        "category": "Bengali",
        "price": 60.0,
        "quantity": 50
    })

    response = client.get("/api/sweets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Rasgulla"