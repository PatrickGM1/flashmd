import { ReactNode } from 'react'
import { Box, Container, IconButton } from '@mui/material'
import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material'
import { fonts, useThemeMode } from '../theme'

interface Props {
  left?: ReactNode
  right?: ReactNode
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  /** when true, content fills remaining height (study screen) instead of scrolling from top */
  fill?: boolean
}

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={onClick ? 'Home' : undefined}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1,
        border: 'none', bgcolor: 'transparent', p: 0, color: 'text.primary',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        '&:hover .mark': onClick ? { transform: 'rotate(-6deg)' } : {},
      }}
    >
      <Box component="img" src="/logo.svg" alt="" className="mark" sx={{ width: 26, height: 26, display: 'block', transition: 'transform 0.18s ease' }} />
      <Box sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 21, letterSpacing: '0.02em', lineHeight: 1 }}>
        flashmd
      </Box>
    </Box>
  )
}

export function ThemeToggle() {
  const { mode, toggle } = useThemeMode()
  return (
    <IconButton size="small" onClick={toggle} aria-label={mode === 'dark' ? 'Switch to light table' : 'Switch to dark table'} title={mode === 'dark' ? 'Light table' : 'Dark table'}>
      {mode === 'dark' ? <LightModeOutlined sx={{ fontSize: 20 }} /> : <DarkModeOutlined sx={{ fontSize: 20 }} />}
    </IconButton>
  )
}

export default function Shell({ left, right, children, maxWidth = 'sm', fill }: Props) {
  return (
    <Box minHeight="100dvh" display="flex" flexDirection="column" bgcolor="background.default">
      <Box
        component="header"
        sx={{
          height: 56, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box display="flex" alignItems="center" minWidth={0}>{left}</Box>
        <Box display="flex" alignItems="center" gap={1}>
          {right}
          <ThemeToggle />
        </Box>
      </Box>

      {fill ? (
        <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
          {children}
        </Box>
      ) : (
        <Container maxWidth={maxWidth} sx={{ flex: 1, pt: { xs: 2, sm: 4 }, pb: { xs: 6, sm: 8 } }}>
          {children}
        </Container>
      )}
    </Box>
  )
}
