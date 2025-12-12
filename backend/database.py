from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client.sweetshop  # database name
users = db.users       # collection
sweets = db.sweets     # collection