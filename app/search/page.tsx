'use client';

// Import necessary hooks and components from Next.js and React
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

// Import Material-UI components for UI design
import {
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Container,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Alert,
  Skeleton,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';

// Import Material-UI icons
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// Import custom type definitions
import type { IconData } from '@/types';

/**
 * SearchContent Component
 * 
 * This component handles the main search functionality and icon display.
 * It's separated from the main component because it uses useSearchParams(),
 * which requires being wrapped in a Suspense boundary for proper SSR/SSG support.
 * Now includes integrated favorites management with localStorage persistence.
 */
function SearchContent() {
  // Extract search parameters from URL using Next.js hook
  const searchParams = useSearchParams();
  const query = searchParams.get('q'); // Get the 'q' parameter from URL
  
  // Router for navigation
  const router = useRouter();

  // State management for component data and UI states
  const [icons, setIcons] = useState<IconData[]>([]); // Store fetched icons
  const [loading, setLoading] = useState(false); // Track loading state
  const [error, setError] = useState<string | null>(null); // Store error messages
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // Store favorite icon IDs
  const [favoriteIcons, setFavoriteIcons] = useState<IconData[]>([]); // Store complete favorite icons data
  const [isClient, setIsClient] = useState(false); // Track if we're on client side

  /**
   * Initialize client-side state and load favorites from localStorage
   */
  useEffect(() => {
    setIsClient(true);
    
    try {
      // Load favorite IDs from localStorage
      const savedFavorites = localStorage.getItem('iconFavorites');
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavorites(new Set(favoriteIds));
      }

      // Load favorite icons data from localStorage
      const savedIconsData = localStorage.getItem('favoriteIconsData');
      if (savedIconsData) {
        const iconsData = JSON.parse(savedIconsData);
        setFavoriteIcons(iconsData);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  /**
   * Effect hook to fetch icons when query changes
   * Triggers API call whenever the search query is updated
   */
  useEffect(() => {
    // Don't fetch if no query is provided
    if (!query) return;

    // Set loading state and clear any previous errors
    setLoading(true);
    setError(null);
    
    // Fetch icons from the API endpoint
    fetch(`/api/icons?q=${encodeURIComponent(query)}`)
      .then((res) => {
        // Check if the response is successful
        if (!res.ok) throw new Error('Failed to fetch icons');
        return res.json();
      })
      .then((data) => {
        // Update icons state with fetched data
        setIcons(data.icons || []);
        setLoading(false);
      })
      .catch((err) => {
        // Handle any errors during the fetch process
        console.error('Error fetching icons:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [query]); // Dependency array - effect runs when query changes

  /**
   * Save favorites to localStorage
   * 
   * @param newFavorites - Set of favorite icon IDs
   * @param newIconsData - Array of complete icon data
   */
  const saveFavoritesToStorage = (newFavorites: Set<string>, newIconsData: IconData[]) => {
    if (!isClient) return;
    
    try {
      localStorage.setItem('iconFavorites', JSON.stringify([...newFavorites]));
      localStorage.setItem('favoriteIconsData', JSON.stringify(newIconsData));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  };

  /**
   * Toggle favorite status for an icon
   * 
   * @param icon - The icon data object to toggle favorite status
   * @param e - The mouse event to prevent default behavior
   */
  const handleToggleFavorite = (icon: IconData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Generate a unique ID if the icon doesn't have one
    let iconId = icon.id?.toString();
    if (!iconId) {
      // Create a unique ID based on icon properties
      iconId = `icon_${icon.name || 'unknown'}_${icon.tags?.[0] || 'notag'}_${Date.now()}`;
      // Add the generated ID to the icon object
      icon.id = iconId;
      console.log('Generated ID for icon:', iconId);
    }

    console.log('Toggling favorite for icon:', iconId, 'Current favorites:', [...favorites]);

    setFavorites(prev => {
      const newFavorites = new Set(prev);
      let newIconsData = [...favoriteIcons];
      
      if (newFavorites.has(iconId)) {
        // Remove from favorites
        console.log('Removing from favorites:', iconId);
        newFavorites.delete(iconId);
        newIconsData = favoriteIcons.filter(favIcon => {
          const favIconId = favIcon.id?.toString() || `icon_${favIcon.name || 'unknown'}_${favIcon.tags?.[0] || 'notag'}`;
          return favIconId !== iconId;
        });
      } else {
        // Add to favorites
        console.log('Adding to favorites:', iconId);
        newFavorites.add(iconId);
        // Check if icon already exists to prevent duplicates
        const iconExists = favoriteIcons.some(favIcon => {
          const favIconId = favIcon.id?.toString() || `icon_${favIcon.name || 'unknown'}_${favIcon.tags?.[0] || 'notag'}`;
          return favIconId === iconId;
        });
        if (!iconExists) {
          newIconsData = [...favoriteIcons, icon];
        }
      }
      
      console.log('New favorites:', [...newFavorites]);
      console.log('New icons data count:', newIconsData.length);
      
      setFavoriteIcons(newIconsData);
      saveFavoritesToStorage(newFavorites, newIconsData);
      return newFavorites;
    });
  };

  /**
   * Check if an icon is in favorites
   * 
   * @param iconId - The ID of the icon to check
   * @returns boolean indicating if the icon is favorited
   */
  const isFavorite = (iconId: string) => {
    return favorites.has(iconId);
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
   * Get the total count of favorite icons
   * 
   * @returns Number of favorite icons
   */
  const getFavoriteCount = () => {
    return favorites.size;
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
   * Navigate back to home page
   */
  const handleGoHome = () => {
    router.push('/');
  };

  /**
   * Navigate to favorites page
   */
  const handleGoToFavorites = () => {
    router.push('/favorites');
  };

  /**
   * Render skeleton loading placeholders
   * Displays placeholder cards while content is loading
   * 
   * @returns JSX element with skeleton cards
   */
  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
          <Card 
            elevation={0}
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            {/* Skeleton for icon image area */}
            <Skeleton variant="rectangular" height={160} />
            <Box sx={{ p: 1 }}>
              {/* Skeleton for icon name */}
              <Skeleton variant="text" width="60%" />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Search Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        {/* Navigation and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          {/* Back button */}
          <IconButton 
            onClick={handleGoHome}
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
            <SearchIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontWeight: 700,
                // Gradient text effect
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Graph Search
            </Typography>
          </Box>

          {/* Favorites button */}
          <Button
            variant="outlined"
            startIcon={<FavoriteIcon />}
            onClick={handleGoToFavorites}
            sx={{
              borderColor: '#1976d2', // Blue to match theme
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              }
            }}
          >
            {getFavoriteCount() > 0 && (
              <Chip 
                label={getFavoriteCount()} 
                size="small" 
                sx={{ 
                  ml: 1, 
                  bgcolor: '#1976d2', // Blue to match theme
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 20
                }} 
              />
            )}
            Favorites
          </Button>
        </Box>
        
        {/* Display current search query */}
        {query && (
          <Typography 
            variant="h5" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            You are searching: "{query}"
          </Typography>
        )}
        
        {/* Display results count when not loading and results exist */}
        {!loading && icons.length > 0 && (
          <Chip 
            label={`We found ${icons.length} icons for "${query}"`}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.9rem' }}
          />
        )}
      </Box>

      {/* Error Display Section */}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Loading State Section */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          {/* Loading spinner */}
          <CircularProgress size={48} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            We are loading...
          </Typography>
          {/* Show skeleton placeholders while loading */}
          <Box sx={{ mt: 4, width: '100%' }}>
            {renderSkeleton()}
          </Box>
        </Box>
      )}

      {/* Main Content Grid Section */}
      {!loading && !error && (
        <Fade in timeout={600}>
          <Box>
            {/* No results state */}
            {icons.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sorry, no icons found for "{query}"
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try a different search term or check your spelling.
                </Typography>
              </Box>
            ) : (
              /* Icons grid display */
              <Grid container spacing={3}>
                {icons.map((icon, index) => {
                  // Extract icon data for rendering
                  const largestRaster = icon.raster_sizes?.[icon.raster_sizes.length - 1];
                  const previewUrl = largestRaster?.formats?.[0]?.preview_url;
                  const iconId = getIconId(icon, index); // Use the new helper function
                  const isIconFavorite = isFavorite(iconId);

                  return (
                    <Grid key={iconId} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                      {/* Zoom animation for each card */}
                      <Zoom in timeout={300 + index * 50}>
                        <Card
                          elevation={0}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            // Hover effects for the card
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                              transform: 'translateY(-4px)',
                            },
                          }}
                        >
                          {/* Action buttons (favorite and download) */}
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
                            {/* Favorite toggle button */}
                            <Tooltip title={isIconFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleToggleFavorite(icon, e)}
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                                  backdropFilter: 'blur(8px)', // Glass effect
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                  },
                                }}
                              >
                                {isIconFavorite ? (
                                  <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                ) : (
                                  <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                                )}
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
                                // Gradient background for icon area
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
                              {isIconFavorite && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    bgcolor: 'rgba(25, 118, 210, 0.9)', // Blue to match theme
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
                              )}
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
                                        bgcolor: 'rgba(25, 118, 210, 0.04)',
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
            )}
          </Box>
        </Fade>
      )}
    </Container>
  );
}

/**
 * SearchFallback Component
 * 
 * This component serves as a fallback UI while the Suspense boundary
 * is waiting for the SearchContent component to load.
 * It displays a minimal loading state with the page header.
 */
function SearchFallback() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header section matching the main component */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <SearchIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              // Gradient text effect
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Graph Search
          </Typography>
        </Box>
      </Box>
      
      {/* Simple loading indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    </Container>
  );
}

/**
 * SearchPage Component (Main Export)
 * 
 * This is the main component that wraps SearchContent in a Suspense boundary.
 * The Suspense boundary is required because SearchContent uses useSearchParams(),
 * which can cause hydration mismatches during SSR/SSG builds.
 * 
 * The Suspense boundary ensures that:
 * 1. The component can be server-side rendered without errors
 * 2. A fallback UI is shown while the search params are being resolved
 * 3. The app remains responsive during the loading process
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}