import { useState } from 'react'
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material'
import { ArrowBackOutlined, SaveOutlined, DownloadOutlined } from '@mui/icons-material'
import { Deck } from '../types'
import { toMarkdown } from '../utils/parser'
import { updateDeck } from '../api'
import { ink, stock } from '../ui'
import { fonts } from '../theme'
import Shell, { Brand } from './Shell'

interface Props {
  deck: Deck
  onSaved: (deck: Deck) => void
  onBack: () => void
}

export default function DeckEditor({ deck, onSaved, onBack }: Props) {
  const [label, setLabel] = useState(deck.label)
  const [text, setText] = useState(() => toMarkdown(deck.chapters))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      onSaved(await updateDeck(deck.id, label.trim() || deck.label, text))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
      setSaving(false)
    }
  }

  const exportFile = () => {
    const blob = new Blob([text], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${label.replace(/[^\w.-]+/g, '_') || 'deck'}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Shell
      left={
        <Button startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />} onClick={onBack} sx={{ ml: -0.5, fontSize: 13 }}>
          Cancel
        </Button>
      }
      right={<Brand />}
      maxWidth="md"
    >
      <Typography variant="h4" sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1, mb: 2.5 }}>Edit deck</Typography>

      {/* The deck laid out as one big card face */}
      <Box sx={{ ...stock, p: { xs: 2, sm: 3 } }}>
        <TextField
          fullWidth
          size="small"
          label="Deck name"
          value={label}
          onChange={e => setLabel(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          minRows={18}
          value={text}
          onChange={e => setText(e.target.value)}
          spellCheck={false}
          inputProps={{ 'aria-label': 'Deck markdown' }}
          InputProps={{
            sx: { fontFamily: fonts.mono, fontSize: 13.5, lineHeight: 1.7, alignItems: 'flex-start', bgcolor: '#faf9f6' },
          }}
          sx={{ mb: 1 }}
        />
        <Typography sx={{ fontSize: 12.5, color: ink.cardMuted }}>
          {'# chapter, ## question, lines below = answer. Progress is kept for questions you do not rename.'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Box display="flex" gap={1.5} mt={3} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <SaveOutlined />}
          onClick={save}
          disabled={saving || !text.trim()}
          sx={{ py: 1.1, flex: 1, minWidth: 160 }}
        >
          Save changes
        </Button>
        <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={exportFile} sx={{ py: 1.1 }}>
          Export .md
        </Button>
      </Box>
    </Shell>
  )
}
