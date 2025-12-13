"""
Sweet Shop Management System - Main Application File

This is the entry point for the FastAPI application. It configures:
- API routes (authentication, sweets management)
- CORS middleware to allow frontend communication
- Database initialization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .routes.auth import router as auth_router
from .routes.sweets import router as sweets_router

# Initialize FastAPI application
app = FastAPI(
    title="Sweet Shop API",
    description="API for managing sweet shop inventory and user authentication"
)

# Configure CORS (Cross-Origin Resource Sharing) to allow the frontend to communicate with the backend
# This is necessary because the frontend (React) runs on localhost:3000 and backend runs on localhost:8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Allowed frontend URLs
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include routers for different features
app.include_router(auth_router)  # Routes for login and registration
app.include_router(sweets_router)  # Routes for sweet operations


@app.get("/")
def home():
    """Welcome endpoint - confirms API is running"""
    return {"message": "Sweet Shop API is running!"}


@app.get("/test-db")
async def test_db():
    """Test database connection - checks if MongoDB is accessible"""
    await db.command("ping")
    return {"message": "MongoDB connected successfully!"}