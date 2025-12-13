from pydantic import BaseModel

class Sweet(BaseModel):
    name: str
    category: str
    price: float
    quantity: int