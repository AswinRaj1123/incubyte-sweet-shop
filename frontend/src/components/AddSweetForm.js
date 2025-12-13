import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import api from '../services/api';

const AddSweetForm = ({ sweetToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    if (sweetToEdit) {
      setFormData({
        name: sweetToEdit.name,
        category: sweetToEdit.category,
        price: sweetToEdit.price,
        quantity: sweetToEdit.quantity
      });
    }
  }, [sweetToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (sweetToEdit) {
        await api.put(`/api/sweets/${sweetToEdit.id}`, formData);
        alert('Sweet updated!');
      } else {
        await api.post('/api/sweets', formData);
        alert('Sweet added!');
      }
      setFormData({ name: '', category: '', price: '', quantity: '' });
      onSuccess();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Try again'));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {sweetToEdit ? 'Edit Sweet' : 'Add New Sweet'}
      </Typography>
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Price"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Quantity"
        name="quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        {sweetToEdit ? 'Update' : 'Add Sweet'}
      </Button>
      {sweetToEdit && (
        <Button onClick={() => onSuccess()} color="inherit" sx={{ mt: 2, ml: 2 }}>
          Cancel
        </Button>
      )}
    </Box>
  );
};

export default AddSweetForm;