import { useState } from 'react'
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'
import { Me } from '../types'
import { changePassword } from '../api'
import { ink, stock } from '../ui'
import { fonts } from '../theme'
import Shell, { Brand } from './Shell'

interface Props {
  me: Me
  onChanged: (me: Me) => void
  onBack: () => void
}

export default function PasswordChange({ me, onChanged, onBack }: Props) {
  const forced = me.mustChangePassword
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mismatch = confirm.length > 0 && next !== confirm

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next !== confirm) return
    setBusy(true)
    setError(null)
    try {
      onChanged(await changePassword(current, next))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password')
      setBusy(false)
    }
  }

  return (
    <Shell
      left={forced ? <Brand /> : (
        <Button startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />} onClick={onBack} sx={{ ml: -0.5, fontSize: 13 }}>Back</Button>
      )}
    >
      <Box component="form" onSubmit={submit} sx={{ ...stock, maxWidth: 400, mx: 'auto', mt: { xs: 2, sm: 6 }, p: { xs: 3, sm: 4 } }}>
        <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 30, lineHeight: 1, mb: 0.5 }}>
          {forced ? 'Pick a new password' : 'Change password'}
        </Typography>
        <Typography sx={{ fontSize: 14, color: ink.cardMuted, mb: 3 }}>
          {forced ? 'The one you signed in with was temporary.' : `Signed in as ${me.username}.`}
        </Typography>

        <TextField fullWidth size="small" label={forced ? 'Temporary password' : 'Current password'} type="password" value={current}
          onChange={e => setCurrent(e.target.value)} autoComplete="current-password" autoFocus sx={{ mb: 2 }} />
        <TextField fullWidth size="small" label="New password" type="password" value={next}
          onChange={e => setNext(e.target.value)} autoComplete="new-password" helperText="At least 8 characters"
          FormHelperTextProps={{ sx: { color: ink.cardMuted, mx: 0 } }} sx={{ mb: 2 }} />
        <TextField fullWidth size="small" label="Repeat new password" type="password" value={confirm}
          onChange={e => setConfirm(e.target.value)} autoComplete="new-password" error={mismatch}
          helperText={mismatch ? 'Passwords do not match' : ' '} FormHelperTextProps={{ sx: { mx: 0 } }} sx={{ mb: 1.5 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button type="submit" variant="contained" fullWidth disabled={busy || !current || next.length < 8 || next !== confirm} sx={{ py: 1.1, fontSize: 15 }}>
          {busy ? <CircularProgress size={18} color="inherit" /> : 'Save password'}
        </Button>
      </Box>
    </Shell>
  )
}
