from fastapi import Header, HTTPException
from jose import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key")
ALGORITHM = "HS256"

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")

    try:
        token = authorization.split("Bearer ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # {"sub": email, "role": "..."}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")