from fastapi import FastAPI
from database import db

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Sweet Shop API is running!"}

@app.get("/test-db")
async def test_db():
    await db.command("ping")
    return {"message": "MongoDB connected successfully!"}