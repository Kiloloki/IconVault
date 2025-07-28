'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Container, Typography } from '@mui/material';

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '4rem', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Icon Search
      </Typography>
      <form onSubmit={handleSearch}>
        <TextField
          fullWidth
          label="Search for icons (e.g. music, cat)"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" color="primary" type="submit">
          Search
        </Button>
      </form>
    </Container>
  );
}
