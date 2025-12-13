/**
 * Sweet Card Component
 * 
 * Displays a single sweet product with:
 * - Product image
 * - Name, category, and price
 * - Current stock level
 * - Purchase button
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box, 
  Chip 
} from '@mui/material';
import api from '../services/api';

const SweetCard = ({ sweet, onPurchaseSuccess }) => {
  /**
   * Handle purchase button click
   * 
   * Calls the API to purchase one unit of this sweet.
   * If successful, refreshes the sweet list to update inventory.
   * If it fails (e.g., out of stock), shows an error message.
   */
  const handlePurchase = async () => {
    try {
      // Send purchase request to backend
      await api.post(`/api/sweets/${sweet.id}/purchase`);
      
      // Refresh the sweet list to show updated inventory
      onPurchaseSuccess();
      
      alert('Purchased successfully!');
    } catch (err) {
      alert('Out of stock or error');
    }
  };

  /**
   * Check if sweet is in stock
   * True if quantity is greater than 0
   */
  const isInStock = sweet.quantity > 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image="https://via.placeholder.com/300x200?text=Sweet+Candy"
        alt={sweet.name}
      />
      
      {/* Product Information */}
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Product Name */}
        <Typography gutterBottom variant="h5" component="div">
          {sweet.name}
        </Typography>
        
        {/* Category */}
        <Typography variant="body2" color="text.secondary">
          Category: {sweet.category}
        </Typography>
        
        {/* Price and Stock */}
        <Box sx={{ mt: 1 }}>
          {/* Price */}
          <Typography variant="h6" color="primary">
            ₹{sweet.price}
          </Typography>
          
          {/* Stock Status Badge */}
          <Chip 
            label={isInStock ? `${sweet.quantity} left` : 'Out of Stock'} 
            color={isInStock ? 'success' : 'error'} 
            size="small" 
            sx={{ mt: 1 }}
          />
        </Box>
      </CardContent>
      
      {/* Purchase Button */}
      <Box sx={{ p: 2 }}>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handlePurchase}
          disabled={!isInStock}  // Disable if out of stock
          color={isInStock ? 'success' : 'inherit'}
        >
          {isInStock ? 'Purchase' : 'Out of Stock'}
        </Button>
      </Box>
    </Card>
  );
};

export default SweetCard;