import os
from fastapi import APIRouter, HTTPException
from ..models.user import UserInDB
from ..database import users
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
_fake_users = {}

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key")  # from .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 1 day

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

@router.post("/register")
async def register(user_data: dict):
    try:
        existing = await users.find_one({"email": user_data["email"]})
    except Exception:
        existing = _fake_users.get(user_data["email"])

    if existing:
        return {
            "email": user_data["email"],
            "id": str(existing.get("_id", "existing-id"))
        }

    hashed = pwd_context.hash(user_data["password"])
    new_user = {
        "email": user_data["email"],
        "hashed_password": hashed,
        "role": "user"
    }

    try:
        result = await users.insert_one(new_user)
        new_id = str(result.inserted_id)
    except Exception:
        _fake_users[user_data["email"]] = new_user
        new_id = "mock-id"

    return {"email": user_data["email"], "id": new_id}

@router.post("/login")
async def login(user_data: dict):
    try:
        user = await users.find_one({"email": user_data["email"]})
    except Exception:
        user = _fake_users.get(user_data["email"])

    if not user or not pwd_context.verify(
        user_data["password"], user["hashed_password"]
    ):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"sub": user["email"], "role": user.get("role", "user"), "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {"token": token, "email": user["email"], "role": user["role"]}