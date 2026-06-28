import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Button, Alert, CircularProgress, LinearProgress } from '@mui/material'
import { DeleteOutlined, UploadFileOutlined } from '@mui/icons-material'
import { Deck, DeckSummary } from '../types'
import { listDecks, getDeck, createDeck, deleteDeck } from '../api'
import { tile, accuracyColor } from '../ui'
import Shell, { Brand } from './Shell'

interface Props {
  onOpenDeck: (deck: Deck) => void
}

export default function Home({ onOpenDeck }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const refresh = () => {
    listDecks()
      .then(setDecks)
      .catch(() => setError('Cannot reach the server. Is the backend running on :8080?'))
      .finally(() => setLoadingList(false))
  }

  useEffect(refresh, [])

  const upload = async (label: string, content: string) => {
    setBusy(true)
    setError(null)
    try {
      onOpenDeck(await createDeck(label, content))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (ev) => upload(file.name, ev.target?.result as string)
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleExample = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/example.md')
      await upload('Example deck', await res.text())
    } catch {
      setError('Failed to load example deck.')
      setBusy(false)
    }
  }

  const open = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      onOpenDeck(await getDeck(id))
    } catch {
      setError('Could not open deck.')
      setBusy(false)
    }
  }

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDecks(d => d.filter(x => x.id !== id))
    try { await deleteDeck(id) } catch { refresh() }
  }

  return (
    <Shell
      left={<Brand />}
      right={
        <Button
          size="small"
          onClick={handleExample}
          disabled={busy}
          sx={{ color: 'text.secondary', fontSize: 13, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
        >
          {busy ? <CircularProgress size={13} color="inherit" sx={{ mr: 1 }} /> : null}
          Example
        </Button>
      }
    >
      {/* Heading */}
      <Typography variant="h4" mb={0.5} sx={{ fontSize: { xs: '1.7rem', sm: '2rem' } }}>
        Your decks
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Pick one to study, or add a new markdown file.
      </Typography>

      {/* Drop zone */}
      <Box
        onClick={() => !busy && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          border: '2px dashed',
          borderColor: dragging ? '#6b5ae0' : '#33333a',
          borderRadius: '14px',
          p: 2.5,
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1,
          bgcolor: dragging ? 'rgba(124,106,247,0.05)' : 'transparent',
          transition: 'border-color 0.15s ease, background 0.15s ease',
          '&:hover': { borderColor: busy ? '#33333a' : '#4a4a54', bgcolor: busy ? undefined : 'rgba(255,255,255,0.012)' },
        }}
      >
        <Box
          sx={{
            width: 46, height: 46, flexShrink: 0, borderRadius: '11px',
            border: '1.5px solid #33333a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <UploadFileOutlined sx={{ color: '#7a7a84', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography fontWeight={600} fontSize={15} color="text.primary">
            Drop a markdown file
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to browse
          </Typography>
        </Box>
        <input ref={fileInputRef} type="file" accept=".md,text/plain" hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(211,47,47,0.08)', color: '#f48fb1', border: '1px solid rgba(211,47,47,0.2)', py: 0.5 }}>
          {error}
        </Alert>
      )}

      {/* Decks */}
      {!loadingList && decks.length > 0 && (
        <Box mt={3}>
          <Box display="flex" flexDirection="column" gap={1.25}>
            {decks.map(deck => {
              const done = deck.known + deck.unknown
              const donePct = deck.totalCards > 0 ? (done / deck.totalCards) * 100 : 0
              const accColor = accuracyColor(deck.known, done)

              return (
                <Box
                  key={deck.id}
                  onClick={() => open(deck.id)}
                  sx={{
                    ...tile,
                    position: 'relative',
                    pl: 2.75, pr: 2, py: 1.75,
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                      bgcolor: accColor,
                      opacity: done === 0 ? 0.5 : 1,
                    },
                    '&:hover .del': { opacity: 1 },
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.25}>
                    <Typography fontWeight={600} fontSize={15} color="text.primary" noWrap sx={{ mr: 2 }}>
                      {deck.label}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1.5} flexShrink={0} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {done === 0 ? (
                        <Typography variant="caption" sx={{ color: '#777', fontWeight: 600 }}>
                          {deck.totalCards} cards
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="caption" sx={{ color: accColor, fontWeight: 700 }}>
                            {deck.known}/{done} correct
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b6b73' }}>
                            {done}/{deck.totalCards} done
                          </Typography>
                        </>
                      )}
                      <DeleteOutlined
                        className="del"
                        onClick={e => remove(deck.id, e)}
                        sx={{ fontSize: 16, color: '#4a4a52', opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.15s, color 0.15s', '&:hover': { color: '#ef5e4e' } }}
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={donePct}
                    sx={{
                      height: 5,
                      '& .MuiLinearProgress-bar': { bgcolor: accColor },
                    }}
                  />
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Shell>
  )
}
