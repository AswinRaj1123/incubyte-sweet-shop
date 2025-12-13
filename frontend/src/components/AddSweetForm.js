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
import { Box, TextField, Button, Typography } from '@mui/material';
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb: 4 }}>
      {/* Form Title - Dynamic based on create vs edit mode */}
      <Typography variant="h5" gutterBottom>
        {sweetToEdit ? 'Edit Sweet' : 'Add New Sweet'}
      </Typography>

      {/* Sweet Name Input */}
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="e.g., Rasgulla, Laddu"
        required
      />

      {/* Category Input */}
      <TextField
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="e.g., Indian, Western, Bengali"
        required
      />

      {/* Price Input */}
      <TextField
        label="Price (₹)"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="Enter price in rupees"
        inputProps={{ step: "0.01" }}  // Allow decimal prices
        required
      />

      {/* Quantity Input */}
      <TextField
        label="Quantity (units)"
        name="quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="Number of units in stock"
        inputProps={{ step: "1" }}  // Only whole numbers
        required
      />

      {/* Submit Button - Dynamic text based on create vs edit */}
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        sx={{ mt: 2 }}
      >
        {sweetToEdit ? 'Update Sweet' : 'Add Sweet'}
      </Button>

      {/* Cancel Button - Only shown when editing */}
      {sweetToEdit && (
        <Button 
          onClick={() => onSuccess()}  // Close edit mode
          color="inherit" 
          sx={{ mt: 2, ml: 2 }}
        >
          Cancel
        </Button>
      )}
    </Box>
  );
};

export default AddSweetForm;