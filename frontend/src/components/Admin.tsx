import { useEffect, useState } from 'react'
import { Box, Typography, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material'
import { ArrowBackOutlined, DeleteOutlined, KeyOutlined, StyleOutlined, ShieldOutlined } from '@mui/icons-material'
import { Account } from '../types'
import { listAccounts, resetAccountPassword, setAccountRole, deleteAccount } from '../api'
import { ink, stock } from '../ui'
import { fonts } from '../theme'
import { useAuth } from '../auth'
import Shell from './Shell'
import { Chip } from './cards'

interface Props {
  onBack: () => void
  onViewDecks: (account: Account) => void
}

export default function Admin({ onBack, onViewDecks }: Props) {
  const { me } = useAuth()
  const [accounts, setAccounts] = useState<Account[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [temp, setTemp] = useState<{ username: string; password: string } | null>(null)

  const refresh = () => listAccounts().then(setAccounts).catch(e => setError(e.message))
  useEffect(() => { refresh() }, [])

  const act = async (fn: () => Promise<unknown>) => {
    setError(null)
    try { await fn(); await refresh() } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
  }

  const reset = (a: Account) => act(async () => {
    if (!window.confirm(`Reset ${a.username}'s password? Their current one stops working.`)) return
    const { password } = await resetAccountPassword(a.id)
    setTemp({ username: a.username, password })
  })

  const toggleRole = (a: Account) => act(() => setAccountRole(a.id, a.role === 'ADMIN' ? 'USER' : 'ADMIN'))

  const remove = (a: Account) => act(async () => {
    if (!window.confirm(`Delete ${a.username} and all ${a.decks} of their decks? This cannot be undone.`)) return
    await deleteAccount(a.id)
  })

  return (
    <Shell
      maxWidth="md"
      left={<Button startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />} onClick={onBack} sx={{ ml: -0.5, fontSize: 13 }}>My decks</Button>}
    >
      <Typography variant="h4" sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1 }}>Accounts</Typography>
      <Typography variant="body2" color="text.secondary" mt={0.75} mb={3}>
        {accounts ? `${accounts.length} ${accounts.length === 1 ? 'seat' : 'seats'} at the table.` : 'Loading…'} No email reset here: you hand out a temporary password, they change it on next sign-in.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!accounts ? <CircularProgress size={22} /> : (
        <Box sx={{ ...stock, overflow: 'hidden' }}>
          <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: '1.4fr 0.8fr 0.9fr 0.9fr auto', gap: 2, px: 2.5, py: 1.25, fontSize: 12.5, fontWeight: 600, color: ink.cardMuted }}>
            <span>Username</span><span>Decks</span><span>Streak</span><span>Last active</span><span />
          </Box>
          {accounts.map(a => {
            const self = a.id === me?.id
            return (
              <Box
                key={a.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr auto', sm: '1.4fr 0.8fr 0.9fr 0.9fr auto' },
                  gap: { xs: 1, sm: 2 }, alignItems: 'center',
                  px: 2.5, py: 1.5,
                  borderTop: `1.5px solid ${ink.cardRule}`,
                }}
              >
                <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
                  <Chip color={a.role === 'ADMIN' ? ink.red : ink.blue} edge={a.role === 'ADMIN' ? ink.redEdge : ink.blueEdge} size={30} title={a.role === 'ADMIN' ? 'Admin' : 'Player'} sx={{ fontSize: 14 }}>
                    {a.username[0].toUpperCase()}
                  </Chip>
                  <Box minWidth={0}>
                    <Typography noWrap sx={{ fontWeight: 600, fontSize: 15 }}>
                      {a.username}{self && <Box component="span" sx={{ color: ink.cardMuted, fontWeight: 500 }}> (you)</Box>}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 12, color: ink.cardMuted }}>
                      {a.role === 'ADMIN' ? 'Admin' : 'Player'}{a.mustChangePassword ? ' · temporary password' : ''} · joined {a.createdAt.slice(0, 10)}
                    </Typography>
                  </Box>
                </Box>
                <Cell sm>{a.decks} {a.decks === 1 ? 'deck' : 'decks'} <Box component="span" sx={{ color: ink.cardMuted }}>· {a.cards} cards</Box></Cell>
                <Cell sm>{a.streak > 0 ? `${a.streak} ${a.streak === 1 ? 'day' : 'days'}` : <Box component="span" sx={{ color: ink.cardMuted }}>none</Box>}</Cell>
                <Cell sm>{a.lastActive ?? <Box component="span" sx={{ color: ink.cardMuted }}>never</Box>}</Cell>
                <Box display="flex" gap={0.25} justifyContent="flex-end">
                  <IconButton size="small" title="Open their decks" aria-label={`Open ${a.username}'s decks`} onClick={() => onViewDecks(a)} sx={{ color: ink.cardMuted, '&:hover': { color: ink.blue } }}><StyleOutlined sx={{ fontSize: 19 }} /></IconButton>
                  <IconButton size="small" title="Reset password" aria-label={`Reset ${a.username}'s password`} onClick={() => reset(a)} sx={{ color: ink.cardMuted, '&:hover': { color: ink.blue } }}><KeyOutlined sx={{ fontSize: 19 }} /></IconButton>
                  <IconButton size="small" title={a.role === 'ADMIN' ? 'Remove admin' : 'Make admin'} aria-label={a.role === 'ADMIN' ? `Remove admin from ${a.username}` : `Make ${a.username} admin`} onClick={() => toggleRole(a)} disabled={self} sx={{ color: a.role === 'ADMIN' ? ink.red : ink.cardMuted, '&:hover': { color: ink.red } }}><ShieldOutlined sx={{ fontSize: 19 }} /></IconButton>
                  <IconButton size="small" title="Delete account" aria-label={`Delete ${a.username}`} onClick={() => remove(a)} disabled={self} sx={{ color: ink.cardMuted, '&:hover': { color: ink.red } }}><DeleteOutlined sx={{ fontSize: 19 }} /></IconButton>
                </Box>
                <Box sx={{ display: { xs: 'block', sm: 'none' }, gridColumn: '1 / -1', fontSize: 12.5, color: ink.cardMuted }}>
                  {a.decks} decks · {a.cards} cards · streak {a.streak} · last active {a.lastActive ?? 'never'}
                </Box>
              </Box>
            )
          })}
        </Box>
      )}

      {/* Shown once: the temporary password. A dialog because this must not be missed or left on screen. */}
      <Dialog open={!!temp} onClose={() => setTemp(null)} PaperProps={{ sx: { ...stock, p: 1, minWidth: { sm: 380 } } }}>
        <DialogTitle sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 24, color: ink.card }}>Temporary password for {temp?.username}</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: ink.cardMuted, mb: 1.5 }}>Hand this over. It works once; they will be asked to pick a new password when they sign in.</Typography>
          <Box sx={{ fontFamily: fonts.mono, fontSize: 22, fontWeight: 600, letterSpacing: '0.08em', color: ink.card, bgcolor: '#f1f0ec', border: `1px solid ${ink.cardRule}`, borderRadius: '8px', px: 2, py: 1.5, textAlign: 'center', userSelect: 'all' }}>
            {temp?.password}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { navigator.clipboard?.writeText(temp?.password ?? '') }} sx={{ color: ink.blue }}>Copy</Button>
          <Button variant="contained" onClick={() => setTemp(null)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Shell>
  )
}

function Cell({ children, sm }: { children: React.ReactNode; sm?: boolean }) {
  return <Box sx={{ display: sm ? { xs: 'none', sm: 'block' } : 'block', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{children}</Box>
}
