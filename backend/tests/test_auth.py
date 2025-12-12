from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "test123"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"