import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c6af7',
    },
    background: {
      default: '#0e0e0e',
      paper: '#161616',
    },
    text: {
      primary: '#e8e8e8',
      secondary: '#888888',
    },
    divider: '#2a2a2a',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #2a2a2a',
          backgroundImage: 'none',
          '&:hover': {
            borderColor: '#7c6af7',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#2a2a2a',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
