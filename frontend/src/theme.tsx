import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { ink, table } from './ui'

type Mode = 'light' | 'dark'
const KEY = 'flashmd-theme'

const ModeCtx = createContext<{ mode: Mode; toggle: () => void }>({ mode: 'light', toggle: () => {} })
export const useThemeMode = () => useContext(ModeCtx)

function initialMode(): Mode {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* private mode */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const fonts = {
  ui: '"Barlow", system-ui, sans-serif',
  index: '"Barlow Condensed", "Barlow", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
}

function build(mode: Mode) {
  const t = table[mode]
  return createTheme({
    palette: {
      mode,
      primary: { main: ink.blue, contrastText: '#fff' },
      error: { main: ink.red },
      background: { default: t.ground, paper: t.stock },
      text: { primary: t.text, secondary: t.muted },
      divider: t.rule,
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: fonts.ui,
      h1: { fontFamily: fonts.index, fontWeight: 600 },
      h2: { fontFamily: fonts.index, fontWeight: 600 },
      h3: { fontFamily: fonts.index, fontWeight: 600 },
      h4: { fontFamily: fonts.index, fontWeight: 600, letterSpacing: '0.005em' },
      h5: { fontFamily: fonts.index, fontWeight: 600, letterSpacing: '0.005em' },
      h6: { fontFamily: fonts.index, fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': { colorScheme: mode },
          '@keyframes deal': {
            from: { transform: 'translateY(-64px) scale(0.6) rotate(-2deg)', opacity: 0 },
            to: { transform: 'none', opacity: 1 },
          },
          body: { backgroundColor: t.ground, color: t.text },
          '::selection': { background: ink.blue, color: '#fff' },
          ':focus-visible': { outline: `2px solid ${t.focus}`, outlineOffset: 2 },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': { background: t.rule, borderRadius: 8, border: `2px solid ${t.ground}` },
          '*::-webkit-scrollbar-thumb:hover': { background: t.muted },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': { transitionDuration: '0.01ms !important', animationDuration: '0.01ms !important' },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'transform 0.06s ease, box-shadow 0.06s ease, background-color 0.15s',
          },
          contained: {
            backgroundColor: ink.blue,
            color: '#fff',
            boxShadow: `0 2px 0 ${ink.blueEdge}`,
            '&:hover': { backgroundColor: ink.blueHover, boxShadow: `0 2px 0 ${ink.blueEdge}` },
            '&:active': { transform: 'translateY(2px)', boxShadow: `0 0 0 ${ink.blueEdge}` },
            '&.Mui-disabled': { backgroundColor: t.rule, color: t.muted, boxShadow: 'none' },
          },
          outlined: {
            borderWidth: 1.5,
            borderColor: t.text,
            color: t.text,
            '&:hover': { borderWidth: 1.5, borderColor: t.text, backgroundColor: t.hover },
          },
          text: {
            color: t.muted,
            '&:hover': { color: t.text, backgroundColor: 'transparent' },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: t.stock,
            color: ink.card,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ink.blue, borderWidth: 1.5 },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ink.cardMuted },
          },
          notchedOutline: { borderColor: ink.cardRule, borderWidth: 1.5 },
          input: { caretColor: ink.blue, '&::placeholder': { color: ink.cardMuted, opacity: 1 } },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { color: ink.cardMuted, '&.Mui-focused': { color: ink.blue } } },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 500 },
          standardError: { backgroundColor: t.stock, color: ink.red, border: `1.5px solid ${ink.red}` },
          filledSuccess: { backgroundColor: ink.good, color: '#fff' },
          filledError: { backgroundColor: ink.red, color: '#fff' },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { color: t.muted, '&:hover': { color: t.text, backgroundColor: t.hover } } },
      },
      MuiCircularProgress: { styleOverrides: { root: { color: ink.blue } } },
    },
  })
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const theme = useMemo(() => build(mode), [mode])
  useEffect(() => {
    try { localStorage.setItem(KEY, mode) } catch { /* ignore */ }
    document.documentElement.style.colorScheme = mode
  }, [mode])
  const value = useMemo(() => ({ mode, toggle: () => setMode(m => (m === 'light' ? 'dark' : 'light')) }), [mode])
  return (
    <ModeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ModeCtx.Provider>
  )
}
