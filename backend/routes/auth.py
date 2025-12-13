import os
from fastapi import APIRouter, HTTPException, Depends, status
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional

from ..database import users  # MongoDB users collection

# =========================
# MODELS
# =========================

class AuthRequest(BaseModel):
    email: str
    password: str
    admin_key: Optional[str] = None

# =========================
# CONFIG
# =========================

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# =========================
# AUTH DEPENDENCY
# =========================

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role", "user")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return {
            "email": email,
            "role": role,
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

# =========================
# REGISTER
# =========================

@router.post("/register")
async def register(user_data: AuthRequest):
    try:
        # Check if user already exists
        existing = await users.find_one({"email": user_data.email})

        if existing:
            return {
                "email": existing["email"],
                "id": str(existing["_id"]),
            }

        # Hash password
        hashed_password = pwd_context.hash(user_data.password)

        # Check if this is an admin registration (if admin_key matches)
        role = "user"
        if user_data.admin_key == "admin123":
            role = "admin"

        new_user = {
            "email": user_data.email,
            "hashed_password": hashed_password,
            "role": role,
        }

        result = await users.insert_one(new_user)

        return {
            "email": user_data.email,
            "id": str(result.inserted_id),
            "role": role,
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Registration failed: {str(e)}"
        )

# =========================
# LOGIN
# =========================

@router.post("/login")
async def login(user_data: AuthRequest):
    try:
        user = await users.find_one({"email": user_data.email})

        if not user or not pwd_context.verify(
            user_data.password, user["hashed_password"]
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Wrong email or password",
            )

        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        token = jwt.encode(
            {
                "sub": user["email"],
                "role": user.get("role", "user"),
                "exp": expire,
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        return {
            "token": token,
            "email": user["email"],
            "role": user["role"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Login failed: {str(e)}"
        )