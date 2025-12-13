/**
 * Admin Panel Page
 * 
 * This is the admin dashboard where administrators can:
 * - Add new sweets to the inventory
 * - Search and filter sweets
 * - Edit sweet details
 * - Delete sweets
 * - Restock sweets (add more units to inventory)
 * 
 * ⚠️ ADMIN ONLY - Only users with admin role can access this page
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  TextField,
  MenuItem,
  Paper,
  Stack,

} from '@mui/material';
import SweetCard from '../components/SweetCard';
import AddSweetForm from '../components/AddSweetForm';
import api from '../services/api';

const Admin = () => {
  // ===== STATE VARIABLES =====
  const [sweets, setSweets] = useState([]);  // List of all sweets
  const [editingSweet, setEditingSweet] = useState(null);  // Sweet currently being edited
  const [restockId, setRestockId] = useState('');  // ID of sweet to restock
  const [restockQty, setRestockQty] = useState('');  // Quantity to add to stock
  
  // Filter states
  const [search, setSearch] = useState('');  // Search query
  const [category, setCategory] = useState('');  // Category filter
  const [minPrice, setMinPrice] = useState('');  // Minimum price filter
  const [maxPrice, setMaxPrice] = useState('');  // Maximum price filter

  /**
   * Fetch sweets from backend with applied filters
   * Builds query parameters and calls the search API
   */
  const fetchSweets = async () => {
    try {
      const params = [];
      
      // Build query parameters from filters
      if (search) params.push(`name=${search}`);
      if (category) params.push(`category=${category}`);
      if (minPrice) params.push(`min_price=${minPrice}`);
      if (maxPrice) params.push(`max_price=${maxPrice}`);
      
      // Construct the API URL
      const url = params.length > 0 
        ? `/api/sweets/search?${params.join('&')}`
        : `/api/sweets/search`;
      
      // Fetch from backend
      const res = await api.get(url);
      setSweets(res.data);
    } catch (err) {
      alert('Error loading sweets');
    }
  };

  /**
   * Load sweets when page first appears
   */
  useEffect(() => {
    fetchSweets();
  }, []);

  /**
   * Delete a sweet from inventory
   * Asks for confirmation before deleting
   */
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        await api.delete(`/api/sweets/${id}`);
        alert('Sweet deleted successfully!');
        fetchSweets();  // Refresh list
      } catch (err) {
        alert('Error deleting sweet: ' + (err.response?.data?.detail || 'Unknown error'));
      }
    }
  };

  /**
   * Add more units of a sweet to inventory
   * Requires valid sweet ID and positive quantity
   */
  const handleRestock = async () => {
    // Validate inputs
    if (!restockId || !restockQty) {
      alert('Please enter both Sweet ID and Quantity');
      return;
    }
    
    try {
      await api.post(`/api/sweets/${restockId}/restock?quantity=${restockQty}`);
      alert('Restocked successfully!');
      
      // Clear inputs
      setRestockId('');
      setRestockQty('');
      
      // Refresh sweet list
      fetchSweets();
    } catch (err) {
      alert('Error restocking: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  /**
   * Clear all filters and reload sweets
   */
  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    // Fetch all sweets without filters
    setTimeout(() => fetchSweets(), 0);
  };

  // ===== RENDER =====
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
        Admin Panel
      </Typography>

      <AddSweetForm
        sweetToEdit={editingSweet}
        onSuccess={() => {
          setEditingSweet(null);
          fetchSweets();
        }}
      />

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 3, 
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }
      }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
          <TextField
            label="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="Indian">Indian</MenuItem>
            <MenuItem value="Western">Western</MenuItem>
            <MenuItem value="Bengali">Bengali</MenuItem>
            <MenuItem value="Gujarati">Gujarati</MenuItem>
          </TextField>
          <TextField
            label="Min Price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            size="small"
            sx={{ minWidth: 130 }}
          />
          <TextField
            label="Max Price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            size="small"
            sx={{ minWidth: 130 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" size="small" onClick={fetchSweets}>
              Apply
            </Button>
            <Button variant="outlined" size="small" onClick={handleResetFilters}>
              Reset
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 3,
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }
      }}>
        <Typography variant="h6" gutterBottom>
          Restock
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Sweet ID"
            value={restockId}
            onChange={(e) => setRestockId(e.target.value)}
            size="small"
            placeholder="Paste sweet ID"
          />
          <TextField
            label="Quantity"
            type="number"
            value={restockQty}
            onChange={(e) => setRestockQty(e.target.value)}
            size="small"
            placeholder="Units to add"
          />
          <Button variant="contained" color="success" onClick={handleRestock}>
            Restock
          </Button>
        </Stack>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Manage Sweets
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        {sweets.map((sweet) => (
          <Grid item xs={12} sm={6} md={4} key={sweet.id}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <SweetCard sweet={sweet} onPurchaseSuccess={fetchSweets} />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" fullWidth onClick={() => setEditingSweet(sweet)}>
                  Edit
                </Button>
                <Button variant="outlined" color="error" size="small" fullWidth onClick={() => handleDelete(sweet.id)}>
                  Delete
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {sweets.length === 0 && (
        <Typography align="center" sx={{ mt: 4 }}>
          No sweets found. Try adjusting your filters or add a new sweet!
        </Typography>
      )}
    </Container>
  );
};

export default Admin;