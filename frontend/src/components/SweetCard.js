import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';
import api from '../services/api';

const SweetCard = ({ sweet, onPurchaseSuccess }) => {
  const handlePurchase = async () => {
    try {
      await api.post(`/api/sweets/${sweet.id}/purchase`);
      onPurchaseSuccess();  // refresh list
      alert('Purchased successfully!');
    } catch (err) {
      alert('Out of stock or error');
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image="https://via.placeholder.com/300x200?text=Sweet+Candy"  // simple placeholder
        alt={sweet.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {sweet.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Category: {sweet.category}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" color="primary">
            ₹{sweet.price}
          </Typography>
          <Chip 
            label={sweet.quantity > 0 ? `${sweet.quantity} left` : 'Out of Stock'} 
            color={sweet.quantity > 0 ? 'success' : 'error'} 
            size="small" 
            sx={{ mt: 1 }}
          />
        </Box>
      </CardContent>
      <Box sx={{ p: 2 }}>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handlePurchase}
          disabled={sweet.quantity === 0}
          color={sweet.quantity > 0 ? 'success' : 'inherit'}
        >
          {sweet.quantity > 0 ? 'Purchase' : 'Out of Stock'}
        </Button>
      </Box>
    </Card>
  );
};

export default SweetCard;