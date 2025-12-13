/**
 * Home Page Component
 * 
 * Displays the catalog of available sweets for customers to browse and purchase.
 * Features:
 * - Search sweets by name
 * - Filter by category
 * - Filter by price range
 * - Purchase individual sweets
 * - Real-time inventory updates
 */

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  TextField, 
  Typography, 
  Box, 
  CircularProgress, 
  MenuItem, 
  Button 
} from '@mui/material';
import SweetCard from '../components/SweetCard';
import api from '../services/api';

const Home = () => {
  // ===== STATE VARIABLES =====
  const [sweets, setSweets] = useState([]);  // List of sweets to display
  const [search, setSearch] = useState('');  // Search query (sweet name)
  const [category, setCategory] = useState('');  // Selected category filter
  const [minPrice, setMinPrice] = useState('');  // Minimum price filter
  const [maxPrice, setMaxPrice] = useState('');  // Maximum price filter
  const [loading, setLoading] = useState(true);  // Loading indicator

  /**
   * Fetch sweets from backend with applied filters
   * 
   * Builds URL query parameters from current filters and calls API.
   * If any filter is missing, it's not included in the query.
   */
  const fetchSweets = async () => {
    try {
      const params = [];
      
      // Add filters to query string only if they have values
      if (search) params.push(`name=${search}`);
      if (category) params.push(`category=${category}`);
      if (minPrice) params.push(`min_price=${minPrice}`);
      if (maxPrice) params.push(`max_price=${maxPrice}`);
      
      // Build the API URL
      const url = params.length > 0 
        ? `/api/sweets/search?${params.join('&')}`
        : `/api/sweets/search`;
      
      // Fetch sweets from backend
      const response = await api.get(url);
      setSweets(response.data);
      setLoading(false);
    } catch (err) {
      alert('Error loading sweets');
      setLoading(false);
    }
  };

  /**
   * Load sweets when component first appears
   * This runs only once when the page is loaded
   */
  useEffect(() => {
    fetchSweets();
  }, []);

  // ===== FILTER EVENT HANDLERS =====

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

  /**
   * Clear all filters and reload sweets
   * setTimeout ensures state is updated before fetch is called
   */
  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    // Fetch all sweets without filters
    setTimeout(() => fetchSweets(), 0);
  };

  /**
   * Reload sweets list after a purchase
   * This keeps the inventory updated in real-time
   */
  const handlePurchase = () => {
    fetchSweets();
  };

  // ===== RENDER =====
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Title */}
      <Typography variant="h3" align="center" gutterBottom>
        Available Sweets
      </Typography>

      {/* Filter Bar */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Search by Name */}
        <TextField
          label="Search by name"
          value={search}
          onChange={handleSearch}
          onKeyDown={(e) => e.key === 'Enter' && fetchSweets()}  // Search on Enter key
          variant="outlined"
          size="small"
          sx={{ minWidth: 200 }}
          placeholder="e.g., Gulab Jamun"
        />
        
        {/* Category Filter Dropdown */}
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
        
        {/* Minimum Price Filter */}
        <TextField
          label="Min Price"
          type="number"
          value={minPrice}
          onChange={handleMinPriceChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: 120 }}
          placeholder="0"
        />
        
        {/* Maximum Price Filter */}
        <TextField
          label="Max Price"
          type="number"
          value={maxPrice}
          onChange={handleMaxPriceChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: 120 }}
          placeholder="1000"
        />
        
        {/* Apply Filters Button */}
        <Button 
          variant="contained" 
          onClick={fetchSweets}
          size="small"
        >
          Filter
        </Button>
        
        {/* Clear Filters Button */}
        <Button 
          variant="outlined" 
          onClick={handleResetFilters}
          size="small"
        >
          Reset
        </Button>
      </Box>

      {/* Sweets Display Area */}
      {loading ? (
        // Loading spinner while fetching
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        // Grid of sweet cards
        <Grid container spacing={4}>
          {sweets.map((sweet) => (
            <Grid item xs={12} sm={6} md={4} key={sweet.id}>
              <SweetCard 
                sweet={sweet} 
                onPurchaseSuccess={handlePurchase}  // Refresh list after purchase
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Results Message */}
      {sweets.length === 0 && !loading && (
        <Typography align="center" sx={{ mt: 4 }}>
          No sweets found. Try adjusting your filters!
        </Typography>
      )}
    </Container>
  );
};

export default Home;