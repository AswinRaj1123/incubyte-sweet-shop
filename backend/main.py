from fastapi import FastAPI
from .database import db
from .routes.auth import router as auth_router
from .routes.sweets import router as sweets_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(sweets_router)

@app.get("/")
def home():
    return {"message": "Sweet Shop API is running!"}

@app.get("/test-db")
async def test_db():
    await db.command("ping")
    return {"message": "MongoDB connected successfully!"}