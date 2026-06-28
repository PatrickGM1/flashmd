import { ReactNode } from 'react'
import { Box, Container } from '@mui/material'

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
      onClick={onClick}
      sx={{
        fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 16,
        letterSpacing: '-0.02em', color: '#ededed',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      flash<span style={{ color: '#9a8cf9' }}>md</span>
    </Box>
  )
}

export default function Shell({ left, right, children, maxWidth = 'sm', fill }: Props) {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="background.default">
      {/* Top bar */}
      <Box
        component="header"
        sx={{
          height: 56,
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.5, sm: 3 },
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'rgba(12,12,13,0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box display="flex" alignItems="center" minWidth={0}>{left}</Box>
        <Box display="flex" alignItems="center" gap={1}>{right}</Box>
      </Box>

      {/* Content */}
      {fill ? (
        <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
          {children}
        </Box>
      ) : (
        <Container maxWidth={maxWidth} sx={{ flex: 1, py: { xs: 4, sm: 6 } }}>
          {children}
        </Container>
      )}
    </Box>
  )
}
