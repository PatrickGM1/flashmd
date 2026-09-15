import { ReactNode, useState } from 'react'
import { Box, Container, IconButton, Menu, MenuItem, ListItemIcon, Divider, Typography } from '@mui/material'
import { DarkModeOutlined, LightModeOutlined, KeyOutlined, LogoutOutlined, ShieldOutlined } from '@mui/icons-material'
import { fonts, useThemeMode } from '../theme'
import { useAuth } from '../auth'
import { ink } from '../ui'
import { Chip } from './cards'
import HowTo from './HowTo'

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

/** The seat: who is signed in, and the way out. Hidden until there is a session. */
export function AccountMenu() {
  const { me, signOut, navigate } = useAuth()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  if (!me) return null
  const close = () => setAnchor(null)
  const admin = me.role === 'ADMIN'
  return (
    <>
      <Chip
        color={admin ? ink.red : ink.blue}
        edge={admin ? ink.redEdge : ink.blueEdge}
        size={30}
        label={`Account menu for ${me.username}`}
        onClick={e => setAnchor(e.currentTarget)}
        sx={{ fontSize: 14 }}
      >
        {me.username[0].toUpperCase()}
      </Chip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close} PaperProps={{ sx: { minWidth: 200, mt: 1 } }}>
        <Box px={2} py={1}>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: ink.card }}>{me.username}</Typography>
          <Typography sx={{ fontSize: 12, color: ink.cardMuted }}>{admin ? 'Admin' : 'Player'}</Typography>
        </Box>
        <Divider />
        {admin && (
          <MenuItem onClick={() => { close(); navigate('admin') }}>
            <ListItemIcon><ShieldOutlined fontSize="small" /></ListItemIcon>Accounts
          </MenuItem>
        )}
        <MenuItem onClick={() => { close(); navigate('password') }}>
          <ListItemIcon><KeyOutlined fontSize="small" /></ListItemIcon>Change password
        </MenuItem>
        <MenuItem onClick={() => { close(); signOut() }}>
          <ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon>Sign out
        </MenuItem>
      </Menu>
    </>
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
          <HowTo />
          <ThemeToggle />
          <AccountMenu />
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
