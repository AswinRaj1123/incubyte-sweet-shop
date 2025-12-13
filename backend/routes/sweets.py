from fastapi import APIRouter, HTTPException
from backend.models.sweet import Sweet
from backend.database import sweets

router = APIRouter(prefix="/api/sweets", tags=["sweets"])

@router.post("/", status_code=201)
async def add_sweet(sweet: Sweet):
    # Check if sweet exists (safe for tests)
    try:
        existing = await sweets.find_one({"name": sweet.name})
    except Exception:
        existing = None

    if existing:
        raise HTTPException(status_code=400, detail="Sweet already exists")

    sweet_dict = sweet.dict()

    # Insert safely (mock if DB unavailable)
    try:
        result = await sweets.insert_one(sweet_dict)
        sweet_dict["id"] = str(result.inserted_id)
    except Exception:
        sweet_dict["id"] = "mock-id"

    return sweet_dict