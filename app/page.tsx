'use client';

// Import React hook for state management
import { useState } from 'react';

// Import Next.js router hook for navigation
import { useRouter } from 'next/navigation';

// Import Material-UI components for UI design
import { 
  TextField, 
  Button, 
  Container, 
  Typography,
  Box,
  Paper,
  InputAdornment,
  Fade,
  Zoom,
  Chip,
  Stack
} from '@mui/material';

// Import Material-UI icons
import {
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

/**
 * Home Component
 * 
 * This is the main landing page component that provides an enhanced search interface
 * for users to search for icons. It features a modern, visually appealing design with
 * animations, gradients, and interactive elements.
 * 
 * Features:
 * - Beautiful gradient background and glassmorphism effects
 * - Animated entrance with Fade and Zoom effects
 * - Enhanced search form with icon and visual improvements
 * - Popular search suggestions as clickable chips
 * - Responsive design with modern Material-UI styling
 * - Form validation (prevents empty searches)
 * - Navigation to search results page with query parameters
 */
export default function Home() {
  // State to track the current search query input
  // This stores the user's input in real-time as they type
  const [query, setQuery] = useState('');
  
  // Next.js router hook for programmatic navigation
  // Used to redirect users to the search page with their query
  const router = useRouter();

  // Popular search terms that users can click as shortcuts
  const popularSearches = [
    'music', 'home', 'user', 'email', 'phone', 'heart', 'star', 'settings'
  ];

  /**
   * Handle form submission for search functionality
   * 
   * This function:
   * 1. Prevents the default form submission behavior
   * 2. Validates that the query is not empty (after trimming whitespace)
   * 3. Navigates to the search page with the query as a URL parameter
   * 
   * @param e - The form submission event
   */
  const handleSearch = (e: React.FormEvent) => {
    // Prevent the default form submission which would reload the page
    e.preventDefault();
    
    // Check if the query has content after removing leading/trailing spaces
    if (query.trim()) {
      // Navigate to the search page with the encoded query parameter
      // encodeURIComponent ensures special characters are properly handled in the URL
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    // Note: If query is empty, nothing happens (implicit validation)
  };

  /**
   * Navigate to favorites page
   */
  const handleGoToFavorites = () => {
    router.push('/favorites');
  };
  /**
   * Handle clicking on popular search suggestions
   * Sets the query and immediately navigates to search results
   * 
   * @param searchTerm - The selected popular search term
   */
  const handlePopularSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    // Full viewport container with gradient background
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Navigation bar with favorites link */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<FavoriteIcon />}
          onClick={handleGoToFavorites}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          My Favorites
        </Button>
      </Box>

      {/* Animated floating elements for visual appeal */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '8vw',   // Using viewport width units
          height: '8vh',  // Using viewport height units
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          }
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '5vw',   // Using viewport width units
          height: '5vh',  // Using viewport height units
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Main content container */}
      <Container maxWidth="md">
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Hero section with animated title */}
            <Zoom in timeout={800}>
              <Box sx={{ mb: 6 }}>
                {/* Main icon with glow effect */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 3,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <AutoAwesomeIcon 
                    sx={{ 
                      fontSize: 60, 
                      color: 'white',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }} 
                  />
                </Box>

                {/* Main title with gradient text */}
                <Typography 
                  variant="h2" 
                  component="h1"
                  sx={{ 
                    fontWeight: 800,
                    color: 'white',
                    mb: 2,
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    fontSize: { xs: '6vw', sm: '5vw', md: '4vw' } // Using viewport width units
                  }}
                >
                  Icon Search
                </Typography>

                {/* Subtitle */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 300,
                    mb: 4,
                    fontSize: { xs: '3.5vw', sm: '2.5vw' } // Using viewport width units
                  }}
                >
                  Discover thousands of beautiful icons for your projects
                </Typography>
              </Box>
            </Zoom>

            {/* Enhanced search form */}
            <Zoom in timeout={1200}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  mb: 4,
                }}
              >
                <form onSubmit={handleSearch}>
                  <Stack spacing={3}>
                    {/* Enhanced search input */}
                    <TextField
                      fullWidth
                      label="What icon are you looking for?"
                      placeholder="Try searching for music, home, user, email..."
                      variant="outlined"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                        sx: {
                          fontSize: '1.2vw', // Using viewport width units
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'white',
                          }
                        }
                      }}
                    />
                    
                    {/* Enhanced search button */}
                    <Button 
                      variant="contained" 
                      size="large"
                      type="submit"
                      startIcon={<SearchIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        fontSize: '1.2vw', // Using viewport width units
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                          boxShadow: '0 12px 30px rgba(102, 126, 234, 0.6)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Search Icons
                    </Button>
                  </Stack>
                </form>
              </Paper>
            </Zoom>

            {/* Popular searches section */}
            <Fade in timeout={1600}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ color: 'white', mr: 1, fontSize: 20 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500
                    }}
                  >
                    Popular Searches
                  </Typography>
                </Box>
                
                {/* Popular search chips */}
                <Stack 
                  direction="row" 
                  spacing={1} 
                  justifyContent="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ maxWidth: 600, mx: 'auto' }}
                >
                  {popularSearches.map((search, index) => (
                    <Zoom key={search} in timeout={1800 + index * 100}>
                      <Chip
                        label={search}
                        onClick={() => handlePopularSearch(search)}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          },
                          '&:active': {
                            transform: 'translateY(0px)',
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                        }}
                      />
                    </Zoom>
                  ))}
                </Stack>
              </Box>
            </Fade>

            {/* Additional info section */}
            <Fade in timeout={2000}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  mt: 6,
                  fontSize: '0.8vw' // Using viewport width units
                }}
              >
                Search through thousands of high-quality icons • Free to use • Multiple formats available
              </Typography>
            </Fade>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}