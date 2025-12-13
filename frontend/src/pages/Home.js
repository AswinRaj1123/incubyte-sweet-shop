import React, { useState, useEffect } from 'react';
import { Container, Grid, TextField, Typography, Box, CircularProgress } from '@mui/material';
import SweetCard from '../components/SweetCard';
import api from '../services/api';

const Home = () => {
  const [sweets, setSweets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSweets = async () => {
    try {
      const response = await api.get(search ? `/api/sweets/search?name=${search}` : '/api/sweets');
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

  const handlePurchase = () => {
    fetchSweets();  // refresh after purchase
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Available Sweets
      </Typography>

      <Box sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
        <TextField
          fullWidth
          label="Search by name"
          value={search}
          onChange={handleSearch}
          onKeyDown={(e) => e.key === 'Enter' && fetchSweets()}
          variant="outlined"
        />
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