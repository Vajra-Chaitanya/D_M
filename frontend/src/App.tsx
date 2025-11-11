import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { indigo, blue } from '@mui/material/colors';
import ChatInterface from './components/ChatInterface';
import api from './services/api';

const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: blue,
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#A0A0A0',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await api.healthCheck();
        setIsApiReady(true);
      } catch (err) {
        console.error('API health check failed:', err);
        setError('Failed to connect to the backend API. Please make sure the server is running.');
      }
    };

    checkApiHealth();
  }, []);

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Connection Error
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Make sure the backend server is running on http://localhost:8000
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!isApiReady) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Connecting to DualMind API...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatInterface />
    </ThemeProvider>
  );
};

export default App;
