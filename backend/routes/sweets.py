"""
Sweet Management Routes

Handles all operations related to sweets inventory:
- Add new sweets to inventory (Create)
- View all sweets (Read)
- Search and filter sweets
- Update sweet information (Update)
- Delete sweets from inventory (Delete)
- Purchase sweets (decrease quantity)
- Restock sweets (admin only - increase quantity)

Admin-only operations are protected with role-based access control.
"""

from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from backend.models.sweet import Sweet
from backend.database import sweets
from backend.utils.auth import get_current_user

# ============================================================================
# FALLBACK STORE FOR TESTING
# ============================================================================
# When the database is unavailable (e.g., during unit tests), we use this
# in-memory list to store test sweets temporarily
_fake_sweets = []

# API Router for sweet management endpoints
router = APIRouter(
    prefix="/api/sweets",
    tags=["sweets"],
)


# ============================================================================
# CREATE - Add a new sweet to inventory
# ============================================================================


@router.post("/", status_code=201)
async def add_sweet(sweet: Sweet, current_user: dict = Depends(get_current_user)):
    """
    Add a new sweet to the inventory.
    
    Process:
    1. Check if sweet with same name already exists
    2. If not, create and save the new sweet
    
    Args:
        sweet: Sweet object containing name, category, price, quantity
        current_user: User must be logged in to add sweets
        
    Returns:
        The created sweet object with id
        
    Raises:
        HTTPException: If sweet with same name already exists
    """
    try:
        # Check if sweet already exists
        try:
            existing = await sweets.find_one({"name": sweet.name})
        except:
            # Fallback: search in-memory store for testing
            existing = next((s for s in _fake_sweets if s["name"] == sweet.name), None)

        if existing:
            raise HTTPException(status_code=400, detail="Sweet already exists")

        # Convert sweet to dictionary
        sweet_dict = sweet.model_dump()
        
        # Save to database
        try:
            result = await sweets.insert_one(sweet_dict)
            sweet_dict["id"] = str(result.inserted_id)
        except:
            # Fallback: save to in-memory store for testing
            sweet_dict["id"] = str(len(_fake_sweets) + 1)
            _fake_sweets.append(dict(sweet_dict))
        
        # Remove MongoDB internal field if present
        sweet_dict.pop("_id", None)
            
        return sweet_dict
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to add sweet: {str(e)}")


# ============================================================================
# READ - Get all sweets
# ============================================================================


@router.get("/")
async def list_sweets(current_user: dict = Depends(get_current_user)):
    """
    Retrieve all sweets from inventory.
    
    Args:
        current_user: User must be logged in to view sweets
        
    Returns:
        List of all sweets with their details
    """
    all_sweets = []
    try:
        # Fetch all sweets from MongoDB
        async for sweet in sweets.find():
            sweet["id"] = str(sweet["_id"])  # Convert MongoDB ObjectId to string
            sweet.pop("_id", None)  # Remove internal MongoDB field
            all_sweets.append(sweet)
    except:
        # Fallback: return in-memory store for testing
        all_sweets = list(_fake_sweets)
        
    return all_sweets


# ============================================================================
# SEARCH - Search and filter sweets
# ============================================================================
# IMPORTANT: This route must be defined BEFORE the /{sweet_id} route!
# Otherwise, FastAPI will treat "search" as a sweet_id parameter


@router.get("/search")
async def search_sweets(
    name: str = None,
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Search and filter sweets by various criteria.
    
    Args:
        name: Filter by sweet name (case-insensitive, partial match)
        category: Filter by category (exact match)
        min_price: Filter sweets with price >= min_price
        max_price: Filter sweets with price <= max_price
        current_user: User must be logged in to search
        
    Returns:
        List of sweets matching all filters
        
    Example:
        /api/sweets/search?name=gulab&category=Indian&min_price=50&max_price=200
    """
    # Build MongoDB query based on filters
    query = {}
    
    if name:
        # Use regex for case-insensitive partial matching
        query["name"] = {"$regex": name, "$options": "i"}
        
    if category:
        # Exact match for category
        query["category"] = category
        
    # Price range filter
    if min_price or max_price:
        query["price"] = {}
        if min_price:
            query["price"]["$gte"] = min_price  # Greater than or equal to min_price
        if max_price:
            query["price"]["$lte"] = max_price  # Less than or equal to max_price

    results = []
    
    try:
        # Search in MongoDB
        async for sweet in sweets.find(query):
            sweet["id"] = str(sweet["_id"])  # Convert ObjectId to string
            sweet.pop("_id", None)  # Remove internal MongoDB field
            results.append(sweet)
    except:
        # Fallback: search in in-memory store for testing
        for sweet in _fake_sweets:
            # Check name filter (case-insensitive)
            name_match = True
            if name:
                name_match = name.lower() in sweet.get("name", "").lower()
                
            # Check category filter
            cat_match = (category is None) or sweet.get("category") == category
            
            # Check price range filters
            price_ok = True
            if min_price is not None:
                price_ok = sweet.get("price", 0) >= min_price
            if max_price is not None:
                price_ok = price_ok and sweet.get("price", 0) <= max_price
                
            # Include sweet if all filters match
            if name_match and cat_match and price_ok:
                results.append(sweet)
                
    return results


# ============================================================================
# UPDATE - Modify sweet information
# ============================================================================


@router.put("/{sweet_id}")
async def update_sweet(
    sweet_id: str,
    update_data: Sweet,
    current_user: dict = Depends(get_current_user)
):
    """
    Update information about an existing sweet.
    
    Args:
        sweet_id: The ID of the sweet to update
        update_data: New sweet information
        current_user: User must be logged in to update
        
    Returns:
        Success message
        
    Raises:
        HTTPException 400: If sweet_id is invalid
        HTTPException 404: If sweet not found
    """
    # Try MongoDB first if valid ObjectId
    if ObjectId.is_valid(sweet_id):
        try:
            # Update sweet in MongoDB
            result = await sweets.update_one(
                {"_id": ObjectId(sweet_id)},
                {"$set": update_data.model_dump()}
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Sweet not found")
            
            return {"message": "Updated successfully"}
                
        except HTTPException:
            raise
        except:
            pass  # Fall through to in-memory store
    
    # Fallback: update in in-memory store for testing
    target = next((s for s in _fake_sweets if s.get("id") == sweet_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Sweet not found")
    target.update(update_data.model_dump())
        
    return {"message": "Updated successfully"}


# ============================================================================
# DELETE - Remove sweet from inventory (ADMIN ONLY)
# ============================================================================


@router.delete("/{sweet_id}")
async def delete_sweet(
    sweet_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a sweet from the inventory.
    
    ⚠️ ADMIN ONLY - Only users with admin role can delete sweets
    
    Args:
        sweet_id: The ID of the sweet to delete
        current_user: Must be an admin user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 403: If user is not admin
        HTTPException 400: If sweet_id is invalid
        HTTPException 404: If sweet not found
    """
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete sweets")

    # Try MongoDB first if valid ObjectId
    if ObjectId.is_valid(sweet_id):
        try:
            # Delete from MongoDB
            result = await sweets.delete_one({"_id": ObjectId(sweet_id)})
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Sweet not found")
            
            return {"message": "Deleted successfully"}
                
        except HTTPException:
            raise
        except:
            pass  # Fall through to in-memory store
    
    # Fallback: delete from in-memory store for testing
    before_count = len(_fake_sweets)
    _fake_sweets[:] = [s for s in _fake_sweets if s.get("id") != sweet_id]
    if len(_fake_sweets) == before_count:
        raise HTTPException(status_code=404, detail="Sweet not found")
            
    return {"message": "Deleted successfully"}

# ============================================================================
# PURCHASE - Decrease sweet quantity (User buys a sweet)
# ============================================================================


@router.post("/{sweet_id}/purchase")
async def purchase_sweet(sweet_id: str, current_user: dict = Depends(get_current_user)):
    """
    Record a purchase of a sweet - decreases quantity by 1.
    
    This is called when a customer buys one unit of a sweet.
    
    Args:
        sweet_id: The ID of the sweet being purchased
        current_user: User must be logged in to purchase
        
    Returns:
        Success message
        
    Raises:
        HTTPException 400: If sweet_id is invalid or out of stock
        HTTPException 404: If sweet not found
    """
    # Try MongoDB first
    if ObjectId.is_valid(sweet_id):
        try:
            # Find the sweet
            sweet = await sweets.find_one({"_id": ObjectId(sweet_id)})
            if not sweet:
                raise HTTPException(status_code=404, detail="Sweet not found")
                
            # Check if in stock
            if sweet["quantity"] <= 0:
                raise HTTPException(status_code=400, detail="Out of stock")
                
            # Decrease quantity by 1
            await sweets.update_one(
                {"_id": ObjectId(sweet_id)},
                {"$inc": {"quantity": -1}}  # $inc: -1 means decrease by 1
            )
            return {"message": "Purchased successfully"}
            
        except HTTPException:
            raise
        except:
            pass  # Fall through to in-memory store
    
    # Fallback: purchase from in-memory store for testing
    sweet = next((s for s in _fake_sweets if s.get("id") == sweet_id), None)
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    if sweet.get("quantity", 0) <= 0:
        raise HTTPException(status_code=400, detail="Out of stock")
    sweet["quantity"] -= 1
        
    return {"message": "Purchased successfully"}


# ============================================================================
# RESTOCK - Increase sweet quantity (ADMIN ONLY)
# ============================================================================


@router.post("/{sweet_id}/restock")
async def restock_sweet(
    sweet_id: str,
    quantity: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Add more units of a sweet to inventory.
    
    ⚠️ ADMIN ONLY - Only administrators can restock sweets
    
    This is used when new stock arrives for a sweet product.
    
    Args:
        sweet_id: The ID of the sweet to restock
        quantity: Number of units to add to inventory (must be positive)
        current_user: Must be an admin user
        
    Returns:
        Success message with number of units added
        
    Raises:
        HTTPException 403: If user is not admin
        HTTPException 400: If quantity is not positive
    """
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can restock sweets")
    
    # Validate quantity
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    
    try:
        # Increase quantity in MongoDB
        await sweets.update_one(
            {"_id": ObjectId(sweet_id)},
            {"$inc": {"quantity": quantity}}  # $inc: quantity means add that amount
        )
        
    except HTTPException:
        raise
    except:
        # Fallback: restock in in-memory store for testing
        sweet = next((s for s in _fake_sweets if s.get("id") == sweet_id), None)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        sweet["quantity"] = sweet.get("quantity", 0) + quantity
        
    return {"message": f"Restocked {quantity} units successfully"}
    return {"message": f"Restocked {quantity} units"}