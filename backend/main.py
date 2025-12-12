from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Sweet Shop API is running!"}