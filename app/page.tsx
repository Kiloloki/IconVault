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
  Typography 
} from '@mui/material';

/**
 * Home Component
 * 
 * This is the main landing page component that provides a search interface
 * for users to search for icons. It features a simple, centered layout with
 * a search form that redirects users to the search results page.
 * 
 * Features:
 * - Centered search form with input field
 * - Form validation (prevents empty searches)
 * - Navigation to search results page with query parameters
 * - Responsive design using Material-UI Container
 */
export default function Home() {
  // State to track the current search query input
  // This stores the user's input in real-time as they type
  const [query, setQuery] = useState('');
  
  // Next.js router hook for programmatic navigation
  // Used to redirect users to the search page with their query
  const router = useRouter();

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

  return (
    // Main container with responsive max-width and centered content
    <Container 
      maxWidth="sm" 
      style={{ 
        marginTop: '4rem',    // Add top spacing from the page top
        textAlign: 'center'   // Center-align all text content
      }}
    >
      {/* Page title/heading */}
      <Typography 
        variant="h4"     // Use h4 typography variant for appropriate sizing
        gutterBottom     // Add bottom margin for spacing
      >
        Icon Search
      </Typography>
      
      {/* Search form wrapper */}
      <form onSubmit={handleSearch}>
        {/* Main search input field */}
        <TextField
          fullWidth           // Make the input take full width of its container
          label="Search for icons (e.g. music, cat)"  // Placeholder text with examples
          variant="outlined"  // Use outlined style for the input
          value={query}       // Controlled component - value comes from state
          onChange={(e) => setQuery(e.target.value)}  // Update state on input change
          margin="normal"     // Add standard margin around the field
        />
        
        {/* Submit button */}
        <Button 
          variant="contained"  // Use filled button style
          color="primary"      // Use primary theme color
          type="submit"        // Set as form submit button
        >
          Search
        </Button>
      </form>
    </Container>
  );
}