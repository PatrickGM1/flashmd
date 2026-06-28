import { useState } from 'react'
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material'
import { ArrowBackOutlined, SaveOutlined, DownloadOutlined } from '@mui/icons-material'
import { Deck } from '../types'
import { toMarkdown } from '../utils/parser'
import { updateDeck } from '../api'
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
        <Button
          startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />}
          onClick={onBack}
          sx={{ color: 'text.secondary', ml: -0.5, fontSize: 13, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
        >
          Cancel
        </Button>
      }
      right={<Brand />}
      maxWidth="md"
    >
      <Typography variant="h5" mb={2}>Edit deck</Typography>

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
        minRows={16}
        value={text}
        onChange={e => setText(e.target.value)}
        spellCheck={false}
        InputProps={{
          sx: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 13.5, lineHeight: 1.7, alignItems: 'flex-start' },
        }}
        sx={{ mb: 1 }}
      />
      <Typography variant="caption" color="text.secondary">
        {'# chapter, ## question, lines below = answer. Progress is kept for questions you do not rename.'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(211,47,47,0.08)', color: '#f48fb1', border: '1px solid rgba(211,47,47,0.2)', py: 0.5 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={1.5} mt={3}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <SaveOutlined />}
          onClick={save}
          disabled={saving || !text.trim()}
          sx={{ py: 1.2, fontWeight: 600, flex: 1 }}
        >
          Save changes
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={exportFile}
          sx={{ py: 1.2, fontWeight: 600, color: 'text.secondary' }}
        >
          Export .md
        </Button>
      </Box>
    </Shell>
  )
}
