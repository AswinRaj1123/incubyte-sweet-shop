import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Button, Box, TextField, MenuItem } from '@mui/material';
import SweetCard from '../components/SweetCard';
import AddSweetForm from '../components/AddSweetForm';
import api from '../services/api';

const Admin = () => {
  const [sweets, setSweets] = useState([]);
  const [editingSweet, setEditingSweet] = useState(null);
  const [restockId, setRestockId] = useState('');
  const [restockQty, setRestockQty] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchSweets = async () => {
    try {
      const params = [];
      
      if (search) params.push(`name=${search}`);
      if (category) params.push(`category=${category}`);
      if (minPrice) params.push(`min_price=${minPrice}`);
      if (maxPrice) params.push(`max_price=${maxPrice}`);
      
      const url = params.length > 0 
        ? `/api/sweets/search?${params.join('&')}`
        : `/api/sweets/search`;
      
      const res = await api.get(url);
      setSweets(res.data);
    } catch (err) {
      alert('Error loading sweets');
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this sweet?')) {
      await api.delete(`/api/sweets/${id}`);
      fetchSweets();
    }
  };

  const handleRestock = async () => {
    if (!restockId || !restockQty) return;
    await api.post(`/api/sweets/${restockId}/restock?quantity=${restockQty}`);
    setRestockId('');
    setRestockQty('');
    fetchSweets();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    // Fetch all sweets without filters
    setTimeout(() => fetchSweets(), 0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Admin Panel
      </Typography>

      <AddSweetForm sweetToEdit={editingSweet} onSuccess={() => {
        setEditingSweet(null);
        fetchSweets();
      }} />

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TextField
          label="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 200 }}
        />
        
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 150 }}
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
          variant="outlined"
          size="small"
          sx={{ minWidth: 120 }}
        />
        
        <TextField
          label="Max Price"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 120 }}
        />
        
        <Button 
          variant="contained" 
          onClick={fetchSweets}
          size="small"
        >
          Filter
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleResetFilters}
          size="small"
        >
          Reset
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Restock Sweet
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          label="Sweet ID"
          value={restockId}
          onChange={(e) => setRestockId(e.target.value)}
          size="small"
        />
        <TextField
          label="Quantity to add"
          type="number"
          value={restockQty}
          onChange={(e) => setRestockQty(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleRestock}>
          Restock
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Manage Sweets
      </Typography>
      <Grid container spacing={4}>
        {sweets.map((sweet) => (
          <Grid item xs={12} sm={6} md={4} key={sweet.id}>
            <SweetCard sweet={sweet} onPurchaseSuccess={fetchSweets} />
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setEditingSweet(sweet)}
              >
                Edit
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                onClick={() => handleDelete(sweet.id)}
              >
                Delete
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Admin;