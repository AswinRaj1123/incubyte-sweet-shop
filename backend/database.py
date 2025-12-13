from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env from backend directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongodb_url)
db = client.sweetshop  # database name
users = db.users       # collection
sweets = db.sweets     # collection