import { useState } from 'react'
import { Box, Typography, Button, TextField, Alert, CircularProgress, FormControlLabel, Checkbox } from '@mui/material'
import { Me } from '../types'
import { login, register } from '../api'
import { ink, stock } from '../ui'
import { fonts } from '../theme'
import Shell, { Brand } from './Shell'

interface Props {
  onSignedIn: (me: Me) => void
}

export default function Login({ onSignedIn }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      onSignedIn(await (mode === 'login' ? login(username, password, remember) : register(username, password, remember)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <Shell left={<Brand />}>
      <Box component="form" onSubmit={submit} sx={{ ...stock, maxWidth: 400, mx: 'auto', mt: { xs: 2, sm: 6 }, p: { xs: 3, sm: 4 } }}>
        <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 30, lineHeight: 1, mb: 0.5 }}>
          {mode === 'login' ? 'Sit down' : 'Take a seat'}
        </Typography>
        <Typography sx={{ fontSize: 14, color: ink.cardMuted, mb: 3 }}>
          {mode === 'login' ? 'Sign in to your decks.' : 'Create an account. Your decks stay yours.'}
        </Typography>

        <TextField fullWidth size="small" label="Username" value={username} onChange={e => setUsername(e.target.value)}
          autoComplete="username" autoFocus inputProps={{ maxLength: 40 }} sx={{ mb: 2 }} />
        <TextField fullWidth size="small" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          helperText={mode === 'register' ? 'At least 8 characters' : undefined}
          FormHelperTextProps={{ sx: { color: ink.cardMuted, mx: 0 } }} sx={{ mb: 1 }} />
        <FormControlLabel
          control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} size="small" sx={{ color: ink.cardRule, '&.Mui-checked': { color: ink.blue } }} />}
          label="Keep me signed in"
          slotProps={{ typography: { sx: { fontSize: 14, color: ink.card } } }}
          sx={{ mb: 2, ml: -1 }}
        />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button type="submit" variant="contained" fullWidth disabled={busy || !username || !password} sx={{ py: 1.1, fontSize: 15 }}>
          {busy ? <CircularProgress size={18} color="inherit" /> : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2.5} flexWrap="wrap" gap={1}>
          <Button size="small" onClick={() => { setMode(m => (m === 'login' ? 'register' : 'login')); setError(null) }} sx={{ color: ink.blue, p: 0, minWidth: 0, '&:hover': { color: ink.blueHover } }}>
            {mode === 'login' ? 'Create an account' : 'I have an account'}
          </Button>
          {mode === 'login' && (
            <Typography sx={{ fontSize: 12.5, color: ink.cardMuted }} title="There is no email reset. An admin sets you a temporary password from the admin panel.">
              Forgot it? Ask your admin.
            </Typography>
          )}
        </Box>
      </Box>
    </Shell>
  )
}
