"""
Authentication Routes

Handles user registration, login, and JWT token management.
This module manages user accounts and ensures only authenticated users can access protected features.
"""

import os
from fastapi import APIRouter, HTTPException, Depends, status
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional

from ..database import users  # MongoDB users collection

# ============================================================================
# FALLBACK STORE FOR TESTING
# ============================================================================
# When the database is unavailable (e.g., during unit tests), we use this
# in-memory list to store test users temporarily
_fake_users = []

# ============================================================================
# DATA MODELS
# ============================================================================


class AuthRequest(BaseModel):
    """
    Login/Registration Request Data
    
    Attributes:
        email: User's email address
        password: User's password
        admin_key: Optional key to register as admin (must be "admin123")
    """
    email: str
    password: str
    admin_key: Optional[str] = None


# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# JWT Token Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key")  # Secret key for signing tokens
ALGORITHM = "HS256"  # Algorithm used for token signing
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # Token expires after 1 day

# OAuth2 setup - enables token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Password hashing context - converts plain passwords to secure hashes
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# API Router for authentication endpoints
router = APIRouter(prefix="/api/auth", tags=["auth"])

# Admin Registration Key - Users who provide this key during registration get admin role
ADMIN_KEY = "admin123"


# ============================================================================
# AUTHENTICATION DEPENDENCY
# ============================================================================


def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Extract and validate user information from JWT token.
    
    This function is used as a dependency to protect routes - only authenticated
    users can access endpoints that depend on this function.
    
    Args:
        token: JWT token from the request header
        
    Returns:
        Dictionary with user email and role
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        # Decode the JWT token and extract user information
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # "sub" contains the email
        role: str = payload.get("role", "user")  # Get user's role (default is "user")

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


# ============================================================================
# USER REGISTRATION
# ============================================================================


@router.post("/register")
async def register(user_data: AuthRequest):
    """
    Create a new user account.
    
    Process:
    1. Check if user already exists (if yes, return existing user)
    2. Hash the password for security
    3. Determine role: "admin" if admin_key is "admin123", otherwise "user"
    4. Save user to database
    
    Args:
        user_data: Contains email, password, and optional admin_key
        
    Returns:
        Dictionary with email, id, and role of the registered user
        
    Raises:
        HTTPException: If registration fails
    """
    try:
        # Check if user already exists
        try:
            existing = await users.find_one({"email": user_data.email})
        except:
            # Fallback: check in-memory store for testing
            existing = next((u for u in _fake_users if u["email"] == user_data.email), None)

        if existing:
            # User already registered, return their info
            return {
                "email": existing["email"],
                "id": str(existing.get("_id", "test_id")),
            }

        # Hash the password - never store plain passwords!
        hashed_password = pwd_context.hash(user_data.password)

        # Determine user role based on admin key
        role = "user"
        if user_data.admin_key == ADMIN_KEY:
            role = "admin"

        # Prepare user data for storage
        new_user = {
            "email": user_data.email,
            "hashed_password": hashed_password,
            "role": role,
            "_id": f"user_{len(_fake_users)}",
        }

        # Save user to database
        try:
            result = await users.insert_one(new_user)
            return {
                "email": user_data.email,
                "id": str(result.inserted_id),
                "role": role,
            }
        except:
            # Fallback: save to in-memory store for testing
            _fake_users.append(new_user)
            return {
                "email": user_data.email,
                "id": str(new_user["_id"]),
                "role": role,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Registration failed: {str(e)}"
        )


# ============================================================================
# USER LOGIN
# ============================================================================


@router.post("/login")
async def login(user_data: AuthRequest):
    """
    Authenticate a user and generate JWT token.
    
    Process:
    1. Find user by email
    2. Verify password is correct
    3. Generate JWT token that contains user info
    4. Return token and user role
    
    Args:
        user_data: Contains email and password
        
    Returns:
        Dictionary with JWT token, email, and role
        
    Raises:
        HTTPException: If email not found or password is wrong (401)
        HTTPException: If login fails for other reasons (400)
    """
    try:
        # Find user in database
        try:
            user = await users.find_one({"email": user_data.email})
        except:
            # Fallback: search in-memory store for testing
            user = next((u for u in _fake_users if u["email"] == user_data.email), None)

        # User not found
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Wrong email or password",
            )
        
        # Verify password
        if not pwd_context.verify(user_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Wrong email or password",
            )

        # Generate JWT token
        token_expiration = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        token = jwt.encode(
            {
                "sub": user["email"],  # Subject: user email
                "role": user.get("role", "user"),  # Include user role in token
                "exp": token_expiration,  # Token expiration time
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        # Return token and user info to be stored in frontend
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