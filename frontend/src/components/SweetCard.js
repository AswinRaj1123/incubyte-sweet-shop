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
    <Card sx={{
      width: '100%',
      height: 440,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 3,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        transform: 'translateY(-4px)'
      }
    }}>
      {/* Product Image */}
      <CardMedia
        component="img"
        image={sweet.image_url || "https://via.placeholder.com/300x200?text=Sweet+Candy"}
        alt={sweet.name}
        sx={{
          width: '100%',
          height: 180,
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=Sweet+Candy";
        }}
      />
      
      {/* Product Information */}
      <CardContent sx={{ flexGrow: 1, pb: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Product Name */}
        <Box sx={{ minHeight: 28, mb: 0.5 }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            fontWeight={700}
            noWrap
            sx={{
              color: '#1f2937',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {sweet.name}
          </Typography>
        </Box>
        
        {/* Category */}
        <Box sx={{ minHeight: 20 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            Category: {sweet.category}
          </Typography>
        </Box>
        
        {/* Price and Stock */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Price */}
          <Typography variant="h6" fontWeight={700} sx={{ color: '#6366f1' }}>
            ₹{sweet.price}
          </Typography>

          <Chip
            label={isInStock ? `${sweet.quantity} left` : 'Out of Stock'}
            color={isInStock ? 'success' : 'error'}
            size="small"
          />
        </Box>
      </CardContent>
      
      {/* Purchase Button */}
      <Box sx={{ p: 2, pt: 1 }}>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handlePurchase}
          disabled={!isInStock}
          color={isInStock ? 'success' : 'inherit'}
          sx={{ 
            borderRadius: 2,
            transition: 'all 0.2s ease',
            backgroundColor: isInStock ? '#10b981' : undefined,
            '&:hover:not(:disabled)': {
              backgroundColor: '#059669',
              transform: 'scale(1.02)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
            }
          }}
        >
          {isInStock ? 'Purchase' : 'Out of Stock'}
        </Button>
      </Box>
    </Card>
  );
};

export default SweetCard;