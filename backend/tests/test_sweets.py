from fastapi.testclient import TestClient
from backend.main import app
from backend.utils.auth import get_current_user  # correct import
from backend.routes.sweets import _fake_sweets
from backend.database import sweets
import pytest
import asyncio

# ----------------- Fake JWT Dependency -----------------
def fake_current_user():
    # Make this user 'admin' to allow delete/restock tests
    return {"email": "test@example.com", "role": "admin"}

app.dependency_overrides[get_current_user] = fake_current_user

client = TestClient(app)

# Clear fake sweets and MongoDB before each test to avoid conflicts
@pytest.fixture(autouse=True)
def clear_fake_sweets():
    # Clear in-memory store
    _fake_sweets.clear()
    
    # Clear MongoDB asynchronously
    async def clear_db():
        try:
            await sweets.delete_many({})
        except:
            pass
    
    try:
        asyncio.run(clear_db())
    except:
        pass
    
    yield
    
    # Clean up after test
    _fake_sweets.clear()
    try:
        asyncio.run(clear_db())
    except:
        pass

# ----------------- CREATE -----------------
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
    assert "id" in data

def test_add_sweet_missing_field():
    response = client.post("/api/sweets", json={
        "name": "Jalebi",
        "price": 40.0
    })
    assert response.status_code == 422  # validation error

# ----------------- READ -----------------
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
    assert any(s["name"] == "Rasgulla" for s in data)

# ----------------- SEARCH -----------------
def test_search_sweets():
    # Create a sweet to search for
    client.post("/api/sweets", json={
        "name": "Rasgulla",
        "category": "Bengali",
        "price": 60.0,
        "quantity": 50
    })
    
    response = client.get("/api/sweets/search", params={"name": "rasg"})
    assert response.status_code == 200
    data = response.json()
    assert any("rasg" in s["name"].lower() for s in data)

# ----------------- PURCHASE -----------------
def test_purchase_sweet():
    # Add a sweet first
    res = client.post("/api/sweets", json={
        "name": "Ladoo",
        "category": "Indian",
        "price": 30.0,
        "quantity": 5
    })
    sweet_id = res.json()["id"]

    response = client.post(f"/api/sweets/{sweet_id}/purchase")
    assert response.status_code == 200
    assert response.json()["message"] == "Purchased successfully"

# ----------------- RESTOCK -----------------
def test_restock_sweet():
    # Add a sweet first
    res = client.post("/api/sweets", json={
        "name": "Barfi",
        "category": "Indian",
        "price": 20.0,
        "quantity": 2
    })
    sweet_id = res.json()["id"]

    response = client.post(f"/api/sweets/{sweet_id}/restock", params={"quantity": 5})
    assert response.status_code == 200
    assert "Restocked 5 units" in response.json()["message"]

# ----------------- UPDATE -----------------
def test_update_sweet():
    res = client.post("/api/sweets", json={
        "name": "Kaju Katli",
        "category": "Indian",
        "price": 120.0,
        "quantity": 10
    })
    sweet_id = res.json()["id"]

    response = client.put(f"/api/sweets/{sweet_id}", json={
        "name": "Kaju Katli Premium",
        "category": "Indian",
        "price": 150.0,
        "quantity": 15
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Updated successfully"

# ----------------- DELETE -----------------
def test_delete_sweet():
    res = client.post("/api/sweets", json={
        "name": "Peda",
        "category": "Indian",
        "price": 25.0,
        "quantity": 10
    })
    sweet_id = res.json()["id"]

    response = client.delete(f"/api/sweets/{sweet_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Deleted successfully"
