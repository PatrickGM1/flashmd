import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'

const body = '"IBM Plex Sans", system-ui, sans-serif'
const display = '"Fredoka", system-ui, sans-serif'

// design tokens
const c = {
  bg: '#0d0d10',
  surface: '#17171b',
  raised: '#1e1e23',
  border: '#2c2c33',
  borderStrong: '#3c3c45',
  text: '#ececf0',
  muted: '#8e8e98',
  accent: '#7c6af7',
  accentEdge: '#4b3fad',
}

const theme = createTheme({
  typography: {
    fontFamily: body,
    h1: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontFamily: display, fontWeight: 600 },
    h5: { fontFamily: display, fontWeight: 600 },
    h6: { fontFamily: display, fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  palette: {
    mode: 'dark',
    primary: { main: c.accent },
    background: { default: c.bg, paper: c.surface },
    text: { primary: c.text, secondary: c.muted },
    divider: c.border,
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: c.bg,
        },
        '::selection': { background: 'rgba(124,106,247,0.3)' },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          background: c.border,
          borderRadius: 8,
          border: `2px solid ${c.bg}`,
        },
        '*::-webkit-scrollbar-thumb:hover': { background: c.borderStrong },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 11, transition: 'transform 0.04s ease, box-shadow 0.04s ease, background-color 0.15s' },
        // physical / pressable primary
        contained: {
          backgroundColor: c.accent,
          color: '#fff',
          boxShadow: `0 3px 0 ${c.accentEdge}`,
          '&:hover': { backgroundColor: '#897af9', boxShadow: `0 3px 0 ${c.accentEdge}` },
          '&:active': { transform: 'translateY(3px)', boxShadow: `0 0 0 ${c.accentEdge}` },
          '&.Mui-disabled': { backgroundColor: '#26262b', color: '#56565e', boxShadow: 'none' },
        },
        outlined: {
          borderWidth: 1.5,
          borderColor: c.border,
          '&:hover': { borderWidth: 1.5, borderColor: c.borderStrong, background: 'rgba(255,255,255,0.02)' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 11,
          backgroundColor: c.raised,
        },
        notchedOutline: { borderColor: c.border, borderWidth: 1.5 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, backgroundColor: '#26262d' },
        bar: { borderRadius: 999 },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { color: c.borderStrong, '&.Mui-checked': { color: c.accent } },
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
