/**
 * Add/Edit Sweet Form Component
 * 
 * A reusable form for both creating new sweets and editing existing ones.
 * 
 * Features:
 * - Dynamic form that switches between "Add" and "Edit" modes
 * - Form fields: name, category, price, quantity
 * - Populated from props when editing an existing sweet
 * - Clears after successful submission
 * - Calls onSuccess callback when operation completes
 * 
 * Props:
 * - sweetToEdit: Sweet object to edit (null if adding new)
 * - onSuccess: Callback function after successful form submission
 */

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Stack } from '@mui/material';
import api from '../services/api';

const AddSweetForm = ({ sweetToEdit, onSuccess }) => {
  // ===== STATE =====
  // Form data structure: contains all sweet fields
  const [formData, setFormData] = useState({
    name: '',  // Sweet name
    category: '',  // Sweet category (Indian, Western, etc.)
    price: '',  // Price in rupees
    quantity: ''  // Units in stock
  });

  /**
   * Populate form when editing a sweet
   * 
   * When a sweet is passed via sweetToEdit prop:
   * - Load all sweet fields into the form
   * - Form will show "Edit Sweet" title
   * - Submit button will say "Update"
   */
  useEffect(() => {
    if (sweetToEdit) {
      // Pre-fill form with existing sweet data
      setFormData({
        name: sweetToEdit.name,
        category: sweetToEdit.category,
        price: sweetToEdit.price,
        quantity: sweetToEdit.quantity
      });
    }
  }, [sweetToEdit]);  // Re-run when sweetToEdit changes

  /**
   * Handle form field changes
   * Updates the specific field that was changed while keeping other fields intact
   */
  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value  // Update only the changed field
    });
  };

  /**
   * Handle form submission for both Create and Update operations
   * 
   * Logic flow:
   * 1. Check if editing (sweetToEdit exists) or creating new
   * 2. Send PUT request if editing, POST if creating
   * 3. Clear form after success
   * 4. Call onSuccess callback to refresh parent component
   * 5. Show error alert if API call fails
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (sweetToEdit) {
        // Edit existing sweet - send PUT request with updated data
        await api.put(`/api/sweets/${sweetToEdit.id}`, formData);
        alert('Sweet updated!');
      } else {
        // Create new sweet - send POST request with form data
        await api.post('/api/sweets', formData);
        alert('Sweet added!');
      }

      // Clear form fields after successful submission
      setFormData({ name: '', category: '', price: '', quantity: '' });

      // Call parent callback to refresh sweet list and close edit mode
      onSuccess();
    } catch (err) {
      // Display error message from backend or generic message
      alert('Error: ' + (err.response?.data?.detail || 'Try again'));
    }
  };

  // ===== RENDER =====
  return (
    <Paper elevation={1} sx={{ 
      p: { xs: 2, md: 3 }, 
      borderRadius: 2, 
      mt: 3, 
      mb: 4,
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom fontWeight={700}>
          {sweetToEdit ? 'Edit Sweet' : 'Add New Sweet'}
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., Rasgulla"
            required
          />

          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., Indian"
            required
          />

          <TextField
            label="Price (₹)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            inputProps={{ step: '0.01' }}
            required
          />

          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            fullWidth
            inputProps={{ step: '1' }}
            required
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {sweetToEdit && (
              <Button onClick={() => onSuccess()} color="inherit" sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="contained" sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}>
              {sweetToEdit ? 'Update' : 'Add Sweet'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default AddSweetForm;