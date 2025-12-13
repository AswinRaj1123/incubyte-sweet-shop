"""
User Model

This model represents a user account in the system.
Users can have different roles (user or admin).
"""

from pydantic import BaseModel, EmailStr


class UserInDB(BaseModel):
    """
    User Account Information
    
    Attributes:
        email: User's unique email address
        hashed_password: The encrypted password (never store plain passwords!)
        role: User's role - either "user" (regular customer) or "admin" (can manage sweets)
    """
    email: EmailStr
    hashed_password: str
    role: str = "user"  # Default role is "user", can be "admin" if registered with admin key