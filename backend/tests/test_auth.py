from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "test123"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_login_success():
    # First register a user
    client.post("/api/auth/register", json={
        "email": "login@test.com",
        "password": "test123"
    })
    
    # Now login
    response = client.post("/api/auth/login", json={
        "email": "login@test.com",
        "password": "test123"
    })
    assert response.status_code == 200
    assert "token" in response.json()

def test_login_wrong_password():
    response = client.post("/api/auth/login", json={
        "email": "login@test.com",
        "password": "wrong"
    })
    assert response.status_code == 401