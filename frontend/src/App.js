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
  const [postersLoading, setPostersLoading] = useState(true);

  useEffect(() => {
    // Load popular movies with posters
    axios.get('http://localhost:5000/popular_movies')
      .then(res => setPopularMovies(res.data))
      .catch(err => console.error(err));
      
    // Load all movie titles for search
    axios.get('http://localhost:5000/movies')
      .then(res => setAllMovies(res.data))
      .catch(err => console.error(err));
    
    // Load recent searches
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
        // Ensure all IDs are numbers (just in case)
        const processedData = {
          selected_movie: {
            ...res.data.selected_movie,
            id: Number(res.data.selected_movie.id)
          },
          recommendations: res.data.recommendations.map(rec => ({
            ...rec,
            id: Number(rec.id),
            similarity_score: Number(rec.similarity_score)
          }))
        };
        
        setSelectedMovie(processedData.selected_movie);
        setRecommendations(processedData.recommendations);
        setLoading(false);
        
        // Update recent searches
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
      <Typography variant="h3" gutterBottom align="center" sx={{ color: '#1976d2', mb: 4 }}>
        Movie Recommendation Engine
      </Typography>

      {/* Search Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recent searches:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {recentSearches.map((search, index) => (
                <Chip
                  key={index}
                  label={search}
                  onClick={() => {
                    setInputValue(search);
                    handleRecommend();
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Popular Movies Section */}
      {!selectedMovie && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Popular Movies</Typography>
          <Grid container spacing={3}>
            {popularMovies.map((movie) => (
              <Grid item xs={6} sm={4} md={3} key={movie.id || movie.title}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
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
            ))}
          </Grid>
        </Box>
      )}

      {/* Selected Movie */}
      {selectedMovie && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            You Selected:
          </Typography>
          <Card sx={{ display: 'flex', maxWidth: 600 }}>
            <CardMedia
              component="img"
              sx={{ width: 200 }}
              image={selectedMovie.poster || 'https://via.placeholder.com/200x300?text=No+Poster'}
              alt={selectedMovie.title}
            />
            <CardContent>
              <Typography variant="h5">{selectedMovie.title}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>Recommended Movies</Typography>
          <Grid container spacing={3}>
            {recommendations.map((movie, index) => (
              <Grid item xs={6} sm={4} md={3} key={movie.id || index}>
                <Card sx={{ height: '100%' }}>
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
                    <Typography variant="body2" color="text.secondary">
                      {/* Similarity: {(movie.similarity_score * 100).toFixed(0)}% */}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default App;