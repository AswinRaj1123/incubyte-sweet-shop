"""
Database Configuration

This file sets up the connection to MongoDB using Motor (async driver).
It initializes the database and collections used by the application.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from .env file
# The .env file is located in the same directory as this file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# MongoDB Connection URL
# Uses the MONGODB_URL from .env file, or falls back to local MongoDB if not provided
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Connect to MongoDB
client = AsyncIOMotorClient(MONGODB_URL)

# Database and Collections
db = client.sweetshop  # Database name
users = db.users  # Collection for storing user accounts (email, password, role)
sweets = db.sweets  # Collection for storing sweet inventory (name, category, price, quantity)