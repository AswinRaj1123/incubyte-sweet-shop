"""
Sweet Model

This model represents a sweet product in the inventory.
Each sweet has a name, category, price, quantity in stock, and an optional image URL.
"""

from pydantic import BaseModel


class Sweet(BaseModel):
    """
    Sweet Product Information
    
    Attributes:
        name: The name of the sweet (e.g., "Gulab Jamun", "Laddu")
        category: The category of the sweet (e.g., "Indian", "Western", "Bengali", "Gujarati")
        price: The price of the sweet in rupees
        quantity: The number of units available in stock
        image_url: URL to the sweet's product image (default: placeholder image)
    """
    name: str
    category: str
    price: float
    quantity: int
    image_url: str = "https://via.placeholder.com/300x200?text=Sweet+Candy"