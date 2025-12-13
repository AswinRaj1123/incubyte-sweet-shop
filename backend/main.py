from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .routes.auth import router as auth_router
from .routes.sweets import router as sweets_router

app = FastAPI()

# Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(sweets_router)

@app.get("/")
def home():
    return {"message": "Sweet Shop API is running!"}

@app.get("/test-db")
async def test_db():
    await db.command("ping")
    return {"message": "MongoDB connected successfully!"}