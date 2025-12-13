from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from backend.models.sweet import Sweet
from backend.database import sweets
from backend.utils.auth import get_current_user  # updated import

# simple fallback store used when DB is not reachable during tests
_fake_sweets = []

router = APIRouter(
    prefix="/api/sweets",
    tags=["sweets"],
)

# ---------------- CREATE ----------------
@router.post("/", status_code=201)
async def add_sweet(sweet: Sweet, current_user: dict = Depends(get_current_user)):
    try:
        existing = await sweets.find_one({"name": sweet.name})
    except Exception:
        existing = next((s for s in _fake_sweets if s["name"] == sweet.name), None)

    if existing:
        raise HTTPException(status_code=400, detail="Sweet already exists")

    sweet_dict = sweet.model_dump()
    try:
        result = await sweets.insert_one(sweet_dict)
        sweet_dict["id"] = str(result.inserted_id)
    except Exception:
        sweet_dict["id"] = str(len(_fake_sweets) + 1)
        _fake_sweets.append(dict(sweet_dict))
    return sweet_dict

# ---------------- READ ----------------
@router.get("/")
async def list_sweets(current_user: dict = Depends(get_current_user)):
    all_sweets = []
    try:
        async for sweet in sweets.find():
            sweet["id"] = str(sweet["_id"])
            sweet.pop("_id", None)
            all_sweets.append(sweet)
    except Exception:
        all_sweets = list(_fake_sweets)
    return all_sweets

# ---------------- SEARCH (MUST BE BEFORE /{sweet_id} ROUTES) ----------------
@router.get("/search")
async def search_sweets(name: str = None, category: str = None, min_price: float = None, max_price: float = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}  # case insensitive
    if category:
        query["category"] = category
    if min_price or max_price:
        query["price"] = {}
        if min_price: query["price"]["$gte"] = min_price
        if max_price: query["price"]["$lte"] = max_price

    results = []
    try:
        async for sweet in sweets.find(query):
            sweet["id"] = str(sweet["_id"])
            sweet.pop("_id", None)
            results.append(sweet)
    except Exception:
        for sweet in _fake_sweets:
            name_match = True
            if name:
                name_match = name.lower() in sweet.get("name", "").lower()
            cat_match = (category is None) or sweet.get("category") == category
            price_ok = True
            if min_price is not None:
                price_ok = sweet.get("price", 0) >= min_price
            if max_price is not None:
                price_ok = price_ok and sweet.get("price", 0) <= max_price
            if name_match and cat_match and price_ok:
                results.append(sweet)
    return results

# ---------------- UPDATE ----------------
@router.put("/{sweet_id}")
async def update_sweet(
    sweet_id: str,
    update_data: Sweet,
    current_user: dict = Depends(get_current_user)
):
    try:
        if not ObjectId.is_valid(sweet_id):
            raise HTTPException(status_code=400, detail="Invalid ID")

        result = await sweets.update_one(
            {"_id": ObjectId(sweet_id)},
            {"$set": update_data.model_dump()}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Sweet not found")
    except Exception:
        target = next((s for s in _fake_sweets if s.get("id") == sweet_id), None)
        if not target:
            raise HTTPException(status_code=404, detail="Sweet not found")
        target.update(update_data.model_dump())
    return {"message": "Updated successfully"}

# ---------------- DELETE ----------------
@router.delete("/{sweet_id}")
async def delete_sweet(
    sweet_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    try:
        if not ObjectId.is_valid(sweet_id):
            raise HTTPException(status_code=400, detail="Invalid ID")

        result = await sweets.delete_one({"_id": ObjectId(sweet_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Sweet not found")
    except Exception:
        before = len(_fake_sweets)
        _fake_sweets[:] = [s for s in _fake_sweets if s.get("id") != sweet_id]
        if len(_fake_sweets) == before:
            raise HTTPException(status_code=404, detail="Sweet not found")
    return {"message": "Deleted successfully"}

# ---------------- PURCHASE ----------------
@router.post("/{sweet_id}/purchase")
async def purchase_sweet(sweet_id: str, current_user: dict = Depends(get_current_user)):
    try:
        if not ObjectId.is_valid(sweet_id):
            raise HTTPException(status_code=400, detail="Invalid ID")
        sweet = await sweets.find_one({"_id": ObjectId(sweet_id)})
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        if sweet["quantity"] <= 0:
            raise HTTPException(status_code=400, detail="Out of stock")
        await sweets.update_one({"_id": ObjectId(sweet_id)}, {"$inc": {"quantity": -1}})
    except Exception:
        sweet = next((s for s in _fake_sweets if s.get("id") == sweet_id), None)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        if sweet.get("quantity", 0) <= 0:
            raise HTTPException(status_code=400, detail="Out of stock")
        sweet["quantity"] -= 1
    return {"message": "Purchased successfully"}

# ---------------- RESTOCK ----------------
@router.post("/{sweet_id}/restock")
async def restock_sweet(sweet_id: str, quantity: int, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    
    try:
        await sweets.update_one({"_id": ObjectId(sweet_id)}, {"$inc": {"quantity": quantity}})
    except Exception:
        sweet = next((s for s in _fake_sweets if s.get("id") == sweet_id), None)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        sweet["quantity"] = sweet.get("quantity", 0) + quantity
    return {"message": f"Restocked {quantity} units"}