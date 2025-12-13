import React, { useState, useEffect } from 'react';
import { Container, Grid, TextField, Typography, Box, CircularProgress, MenuItem, Button } from '@mui/material';
import SweetCard from '../components/SweetCard';
import api from '../services/api';

const Home = () => {
  const [sweets, setSweets] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);

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
      
      const response = await api.get(url);
      setSweets(response.data);
      setLoading(false);
    } catch (err) {
      alert('Error loading sweets');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    // Fetch all sweets without filters
    setTimeout(() => fetchSweets(), 0);
  };

  const handlePurchase = () => {
    fetchSweets();  // refresh after purchase
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Available Sweets
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TextField
          label="Search by name"
          value={search}
          onChange={handleSearch}
          onKeyDown={(e) => e.key === 'Enter' && fetchSweets()}
          variant="outlined"
          size="small"
          sx={{ minWidth: 200 }}
        />
        
        <TextField
          select
          label="Category"
          value={category}
          onChange={handleCategoryChange}
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
          onChange={handleMinPriceChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: 120 }}
        />
        
        <TextField
          label="Max Price"
          type="number"
          value={maxPrice}
          onChange={handleMaxPriceChange}
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {sweets.map((sweet) => (
            <Grid item xs={12} sm={6} md={4} key={sweet.id}>
              <SweetCard sweet={sweet} onPurchaseSuccess={handlePurchase} />
            </Grid>
          ))}
        </Grid>
      )}

      {sweets.length === 0 && !loading && (
        <Typography align="center" sx={{ mt: 4 }}>
          No sweets found
        </Typography>
      )}
    </Container>
  );
};

export default Home;