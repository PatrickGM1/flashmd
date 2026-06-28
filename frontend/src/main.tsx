import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'

const display = '"Space Grotesk", system-ui, sans-serif'
const body = '"Inter", system-ui, sans-serif'

const theme = createTheme({
  typography: {
    fontFamily: body,
    h1: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: display, fontWeight: 600 },
    button: { fontFamily: body, textTransform: 'none', fontWeight: 600 },
    body1: { letterSpacing: '-0.005em' },
    body2: { letterSpacing: '-0.005em' },
  },
  palette: {
    mode: 'dark',
    primary: { main: '#7c6af7' },
    background: {
      default: '#0c0c0d',
      paper: '#141416',
    },
    text: {
      primary: '#ededed',
      secondary: '#8a8a8f',
    },
    divider: '#222225',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { notchedOutline: { borderColor: '#222225' } },
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
