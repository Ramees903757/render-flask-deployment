// App.js (React Frontend)

import React, { useState, useEffect } from 'react';
import {
  Container,
  Autocomplete,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Alert,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Grid
} from '@mui/material';
import axios from 'axios';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/popular_movies')
      .then(res => setPopularMovies(res.data))
      .catch(err => console.error(err));

    axios.get('http://localhost:5000/movies')
      .then(res => setAllMovies(res.data))
      .catch(err => console.error(err));

    const savedSearches = localStorage.getItem('recentMovieSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleRecommend = () => {
    if (!inputValue.trim()) {
      setError('Please enter a movie title');
      return;
    }

    setLoading(true);
    setError(null);

    axios.post('http://localhost:5000/recommend', { title: inputValue })
      .then(res => {
        setSelectedMovie(res.data.selected_movie);
        setRecommendations(res.data.recommendations);
        setLoading(false);

        const newRecentSearches = [...new Set([inputValue, ...recentSearches])].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentMovieSearches', JSON.stringify(newRecentSearches));
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Movie not found');
        setLoading(false);
      });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" align="center" gutterBottom color="primary">
        Movie Recommendation Engine
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Autocomplete
            freeSolo
            options={allMovies}
            inputValue={inputValue}
            onInputChange={(event, newValue) => setInputValue(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Search movies" fullWidth />
            )}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleRecommend}
            disabled={loading}
            sx={{ height: '56px', minWidth: '180px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
          </Button>
        </Box>

        {recentSearches.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Recent searches:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {recentSearches.map((search, idx) => (
                <Chip
                  key={idx}
                  label={search}
                  onClick={() => {
                    setInputValue(search);
                    handleRecommend();
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {!selectedMovie && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Popular Movies</Typography>
          <Grid container spacing={3}>
            {popularMovies.map((movie) => {
              console.log("Popular Poster URL:", movie.poster);

              return (
                <Grid item xs={6} sm={4} md={3} key={movie.id}>
                  <Card
                    sx={{ cursor: 'pointer', '&:hover': { transform: 'scale(1.03)' }, transition: 'transform 0.2s' }}
                    onClick={() => {
                      setInputValue(movie.title);
                      handleRecommend();
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="300"
                      image={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={movie.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography noWrap>{movie.title}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}


      {selectedMovie && (
        <Box sx={{ mb: 4 }}>
          {console.log("Selected Movie:", selectedMovie)}
          <Typography variant="h5" gutterBottom>You Selected:</Typography>
          <Card sx={{ display: 'flex', maxWidth: 600 }}>
            <CardMedia
              component="img"
              sx={{ width: 200, objectFit: 'cover' }}
              image={selectedMovie.poster || 'https://via.placeholder.com/200x300?text=No+Poster'}
              alt={selectedMovie.title}
            />
            <CardContent>
              <Typography variant="h5">{selectedMovie.title}</Typography>
              {selectedMovie.overview && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedMovie.overview}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}


      {recommendations.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>Recommended Movies</Typography>
          <Grid container spacing={3}>
            {recommendations.map((movie, index) => {
              console.log(`Recommended Movie ${index + 1}:`, movie);
              return (
                <Grid item xs={6} sm={4} md={3} key={movie.id || index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="300"
                      image={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={movie.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography gutterBottom noWrap>
                        {index + 1}. {movie.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

    </Container>
  );
}

export default App;