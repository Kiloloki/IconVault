'use client';

// Import necessary hooks and components from React and Next.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import Material-UI components for UI design
import {
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  Container,
  Box,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Button,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid';

// Import Material-UI icons
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

// Import custom type definitions
import type { IconData } from '@/types';

/**
 * FavoritesPage Component
 * 
 * This component displays all user's favorite/starred icons in a grid layout.
 * It provides functionality to view, download, and remove favorites.
 * 
 * Features:
 * - Display all favorite icons in a responsive grid
 * - Remove icons from favorites
 * - Download favorite icons
 * - Navigate back to search or home
 * - Empty state when no favorites exist
 * - Persistent storage using localStorage
 */
export default function FavoritesPage() {
  // State management for component data and UI states
  const [favoriteIcons, setFavoriteIcons] = useState<IconData[]>([]); // Store favorite icons data
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // Store favorite IDs
  const [loading, setLoading] = useState(true); // Track loading state
  
  // Next.js router hook for navigation
  const router = useRouter();

  /**
   * Load favorites from localStorage
   */
  const loadFavorites = () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Get favorite IDs from localStorage
      const savedFavorites = localStorage.getItem('iconFavorites');
      const favoriteIds = savedFavorites ? JSON.parse(savedFavorites) : [];
      
      // Get favorite icons data from localStorage
      const savedIconsData = localStorage.getItem('favoriteIconsData');
      const iconsData = savedIconsData ? JSON.parse(savedIconsData) : [];
      
      console.log('Loading favorites - IDs:', favoriteIds);
      console.log('Loading favorites - Data count:', iconsData.length);
      
      // Update state with loaded data
      setFavorites(new Set(favoriteIds));
      setFavoriteIcons(iconsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setLoading(false);
    }
  };

  /**
   * Load favorites from localStorage on component mount
   * Retrieves both the favorite IDs and their corresponding icon data
   */
  useEffect(() => {
    loadFavorites();
  }, []);

  /**
   * Listen for storage changes to sync favorites across tabs
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'iconFavorites' || e.key === 'favoriteIconsData') {
        console.log('Storage changed, reloading favorites');
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Remove an icon from favorites
   * Updates both state and localStorage
   * 
   * @param iconId - The unique identifier for the icon to remove
   */
  const removeFavorite = (iconId: string) => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    try {
      console.log('Removing favorite:', iconId);
      
      // Update favorites set
      const newFavorites = new Set(favorites);
      newFavorites.delete(iconId);
      setFavorites(newFavorites);
      
      // Remove from icons data array
      const updatedIcons = favoriteIcons.filter(icon => {
        const currentIconId = icon.id?.toString() || `icon_${icon.name || 'unknown'}_${icon.tags?.[0] || 'notag'}`;
        return currentIconId !== iconId;
      });
      setFavoriteIcons(updatedIcons);
      
      // Update localStorage
      localStorage.setItem('iconFavorites', JSON.stringify([...newFavorites]));
      localStorage.setItem('favoriteIconsData', JSON.stringify(updatedIcons));
      
      console.log('Removed favorite successfully, remaining:', updatedIcons.length);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  /**
   * Generate or get icon ID for consistent identification
   * 
   * @param icon - The icon object
   * @param index - The index as fallback
   * @returns string - unique identifier for the icon
   */
  const getIconId = (icon: IconData, index: number) => {
    if (icon.id) {
      return icon.id.toString();
    }
    // Generate a consistent ID based on icon properties
    return `icon_${icon.name || 'unknown'}_${icon.tags?.[0] || 'notag'}_${index}`;
  };

  /**
   * Handle icon download functionality
   * Creates a temporary download link and triggers the download
   * 
   * @param icon - The icon data object containing download information
   * @param e - The mouse event to prevent default behavior
   */
  const handleDownload = (icon: IconData, e: React.MouseEvent) => {
    // Prevent the card click event from triggering
    e.preventDefault();
    e.stopPropagation();
    
    // Get the largest available raster size for best quality
    const largestRaster = icon.raster_sizes?.[icon.raster_sizes.length - 1];
    const downloadUrl = largestRaster?.formats?.[0]?.preview_url;
    
    // If download URL is available, create and trigger download
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${icon.name || 'icon'}.png`; // Set filename
      document.body.appendChild(link);
      link.click(); // Trigger download
      document.body.removeChild(link); // Clean up
    }
  };

  /**
   * Navigate back to the previous page
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Navigate to the search page
   */
  const handleGoToSearch = () => {
    router.push('/');
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="h6" color="text.secondary">
            Loading your favorites...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    // Full viewport container with gradient background (matching search page style)
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Blue gradient to match home page
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
      {/* Animated floating elements for visual appeal */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '6vw',
          height: '6vh',
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
          top: '65%',
          right: '20%',
          width: '4vw',
          height: '4vh',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            {/* Navigation and title */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <IconButton 
                onClick={handleGoBack}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h3" 
                  component="h1"
                  sx={{ 
                    fontWeight: 800,
                    color: 'white',
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '5vw', sm: '4vw', md: '3vw' }
                  }}
                >
                  <FavoriteIcon sx={{ color: '#1976d2', fontSize: 'inherit' }} />
                  My Favorites
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 300,
                    mt: 1,
                    fontSize: { xs: '3vw', sm: '2vw' }
                  }}
                >
                  {favoriteIcons.length > 0 
                    ? `You have ${favoriteIcons.length} favorite icon${favoriteIcons.length === 1 ? '' : 's'}`
                    : 'No favorites yet'
                  }
                </Typography>
              </Box>
            </Stack>

            {/* Action buttons */}
            {favoriteIcons.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${favoriteIcons.length} icons saved`}
                  icon={<StarBorderIcon />}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: 500,
                  }}
                />
              </Box>
            )}
          </Box>
        </Fade>

        {/* Main Content */}
        {favoriteIcons.length === 0 ? (
          /* Empty state when no favorites */
          <Fade in timeout={1200}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 4,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  mb: 4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              >
                <FavoriteBorderIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: '#1976d2', // Blue color to match theme
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }} 
                />
              </Box>
              
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  mb: 2,
                  fontSize: { xs: '5vw', sm: '4vw', md: '2.5vw' }
                }}
              >
                No Favorites Yet
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4, 
                  maxWidth: 500, 
                  mx: 'auto',
                  fontWeight: 300,
                  fontSize: { xs: '3.5vw', sm: '2.5vw' }
                }}
              >
                Start building your collection by favoriting icons you love. 
                Click the heart icon on any icon to add it to your favorites.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={handleGoToSearch}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1.1vw',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Start Searching
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleGoBack}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1.1vw',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Go Back
                </Button>
              </Stack>
            </Box>
          </Fade>
        ) : (
          /* Favorites grid display */
          <Fade in timeout={1000}>
            <Box>
              <Grid container spacing={3}>
                {favoriteIcons.map((icon, index) => {
                  // Extract icon data for rendering
                  const largestRaster = icon.raster_sizes?.[icon.raster_sizes.length - 1];
                  const previewUrl = largestRaster?.formats?.[0]?.preview_url;
                  const iconId = getIconId(icon, index); // Use the new helper function

                  return (
                    <Grid key={iconId} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                      {/* Zoom animation for each card */}
                      <Zoom in timeout={300 + index * 50}>
                        <Card
                          elevation={0}
                          sx={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: 3,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            // Hover effects for the card
                            '&:hover': {
                              borderColor: 'rgba(255,255,255,0.5)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                              transform: 'translateY(-8px)',
                            },
                          }}
                        >
                          {/* Action buttons (remove from favorites and download) */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 2,
                              display: 'flex',
                              gap: 0.5,
                              opacity: 0, // Hidden by default
                              transition: 'opacity 0.2s',
                              // Show on card hover
                              '.MuiCard-root:hover &': {
                                opacity: 1,
                              },
                            }}
                          >
                            {/* Remove from favorites button */}
                            <Tooltip title="Remove from Favorites">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeFavorite(iconId);
                                }}
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                                  backdropFilter: 'blur(8px)', // Glass effect
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                  },
                                }}
                              >
                                <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                              </IconButton>
                            </Tooltip>
                            
                            {/* Download button */}
                            <Tooltip title="Download Icon">
                              <IconButton
                                size="small"
                                onClick={(e) => handleDownload(icon, e)}
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                                  backdropFilter: 'blur(8px)', // Glass effect
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                  },
                                }}
                              >
                                <DownloadIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          {/* Main card content area */}
                          <CardActionArea
                            component="a"
                            href={previewUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            {/* Icon image display area */}
                            <Box
                              sx={{
                                height: 160,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                // Gradient background for icon area - blue theme
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                position: 'relative',
                                overflow: 'hidden',
                              }}
                            >
                              <CardMedia
                                component="img"
                                image={previewUrl}
                                alt={icon.tags?.[0] || icon.name || 'icon'}
                                sx={{
                                  maxWidth: '80%',
                                  maxHeight: '80%',
                                  objectFit: 'contain',
                                  transition: 'transform 0.3s ease',
                                  // Scale effect on hover
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              />
                              
                              {/* Favorite indicator */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  bgcolor: 'rgba(25, 118, 210, 0.9)', // Blue color to match theme
                                  borderRadius: '50%',
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <FavoriteIcon sx={{ fontSize: 14, color: 'white' }} />
                              </Box>
                            </Box>

                            {/* Icon information section */}
                            <Box sx={{ p: 1.5, flexGrow: 1 }}>
                              {/* Icon name display */}
                              {icon.name && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    mb: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {icon.name}
                                </Typography>
                              )}
                              
                              {/* Icon tags display */}
                              {icon.tags && icon.tags.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                  {/* Display first 2 tags */}
                                  {icon.tags.slice(0, 2).map((tag, tagIndex) => (
                                    <Chip
                                      key={tagIndex}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.7rem',
                                        height: 20,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(25, 118, 210, 0.04)', // Blue theme
                                        borderColor: 'rgba(25, 118, 210, 0.2)',
                                      }}
                                    />
                                  ))}
                                  {/* Show additional tags count if more than 2 */}
                                  {icon.tags.length > 2 && (
                                    <Chip
                                      label={`+${icon.tags.length - 2}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.7rem',
                                        height: 20,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(158, 158, 158, 0.04)',
                                        borderColor: 'rgba(158, 158, 158, 0.2)',
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Zoom>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
}