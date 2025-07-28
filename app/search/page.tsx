'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import type { IconData } from '@/types';

// 将使用 useSearchParams 的逻辑提取到单独的组件中
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [icons, setIcons] = useState<IconData[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    setError(null);
    
    fetch(`/api/icons?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch icons');
        return res.json();
      })
      .then((data) => {
        setIcons(data.icons || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching icons:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  const toggleFavorite = (iconId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(iconId)) {
        newFavorites.delete(iconId);
      } else {
        newFavorites.add(iconId);
      }
      return newFavorites;
    });
  };

  const handleDownload = (icon: IconData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const largestRaster = icon.raster_sizes?.[icon.raster_sizes.length - 1];
    const downloadUrl = largestRaster?.formats?.[0]?.preview_url;
    
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${icon.name || 'icon'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render skeleton for loading state
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
            <Skeleton variant="rectangular" height={160} />
            <Box sx={{ p: 1 }}>
              <Skeleton variant="text" width="60%" />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <SearchIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Graph Search
          </Typography>
        </Box>
        
        {query && (
          <Typography 
            variant="h5" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            You are searching: "{query}"
          </Typography>
        )}
        
        {!loading && icons.length > 0 && (
          <Chip 
            label={`We found ${icons.length} icons for "${query}"`}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.9rem' }}
          />
        )}
      </Box>

      {/* Error */}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={48} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            We are loading...
          </Typography>
          <Box sx={{ mt: 4, width: '100%' }}>
            {renderSkeleton()}
          </Box>
        </Box>
      )}

      {/* Grid */}
      {!loading && !error && (
        <Fade in timeout={600}>
          <Box>
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
              <Grid container spacing={3}>
                {icons.map((icon, index) => {
                  const largestRaster = icon.raster_sizes?.[icon.raster_sizes.length - 1];
                  const previewUrl = largestRaster?.formats?.[0]?.preview_url;
                  const iconId = icon.id?.toString() || index.toString();
                  const isFavorite = favorites.has(iconId);

                  return (
                    <Grid key={iconId} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
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
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                              transform: 'translateY(-4px)',
                            },
                          }}
                        >
                          {/* Icons */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 2,
                              display: 'flex',
                              gap: 0.5,
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '.MuiCard-root:hover &': {
                                opacity: 1,
                              },
                            }}
                          >
                            <Tooltip title={isFavorite ? "Cancel Favorite" : "Favorite"}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(iconId);
                                }}
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                                  backdropFilter: 'blur(8px)',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                  },
                                }}
                              >
                                {isFavorite ? (
                                  <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                ) : (
                                  <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Download Icon">
                              <IconButton
                                size="small"
                                onClick={(e) => handleDownload(icon, e)}
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                                  backdropFilter: 'blur(8px)',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                  },
                                }}
                              >
                                <DownloadIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>

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
                            {/* Show */}
                            <Box
                              sx={{
                                height: 160,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
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
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              />
                            </Box>

                            {/* Icon Information */}
                            <Box sx={{ p: 1.5, flexGrow: 1 }}>
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
                              
                              {icon.tags && icon.tags.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
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

// 加载状态的 fallback 组件
function SearchFallback() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <SearchIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Graph Search
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    </Container>
  );
}

// 主组件
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}