import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Button, Alert, CircularProgress, LinearProgress } from '@mui/material'
import { DeleteOutlined, UploadFileOutlined } from '@mui/icons-material'
import { Deck, DeckSummary } from '../types'
import { listDecks, getDeck, createDeck, deleteDeck } from '../api'
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
      {/* Drop zone */}
      <Box
        onClick={() => !busy && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        sx={{
          border: '1px dashed',
          borderColor: dragging ? 'primary.main' : '#2c2c30',
          borderRadius: 2.5,
          py: 6, px: 4,
          cursor: busy ? 'default' : 'pointer',
          textAlign: 'center',
          opacity: busy ? 0.6 : 1,
          bgcolor: dragging ? 'rgba(124,106,247,0.06)' : 'rgba(255,255,255,0.012)',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: busy ? '#2c2c30' : '#7c6af7', bgcolor: busy ? undefined : 'rgba(124,106,247,0.04)' },
        }}
      >
        <Box
          sx={{
            width: 44, height: 44, mx: 'auto', mb: 2, borderRadius: 2,
            bgcolor: 'rgba(124,106,247,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <UploadFileOutlined sx={{ color: 'primary.main', fontSize: 22 }} />
        </Box>
        <Typography fontWeight={600} fontSize={15} color="text.primary">
          Drop a markdown file
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          or click to browse
        </Typography>
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
        <Box mt={5}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 600 }}>
            Your decks
          </Typography>
          <Box mt={1.5} display="flex" flexDirection="column" gap={1}>
            {decks.map(deck => {
              const studied = deck.known + deck.unknown
              const pct = studied > 0 ? Math.round((deck.known / deck.totalCards) * 100) : null
              const barColor = pct === null ? '#3a3a40' : pct >= 80 ? '#66bb6a' : pct >= 50 ? '#ffa726' : '#ef5350'

              return (
                <Box
                  key={deck.id}
                  onClick={() => open(deck.id)}
                  sx={{
                    border: '1px solid', borderColor: 'divider', borderRadius: 2,
                    px: 2, py: 1.75,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    '&:hover': { borderColor: '#3a3548', bgcolor: 'rgba(255,255,255,0.015)' },
                    '&:hover .del': { opacity: 1 },
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography fontWeight={600} fontSize={14} color="text.primary" noWrap sx={{ mr: 2 }}>
                      {deck.label}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1.5} flexShrink={0}>
                      <Typography variant="caption" sx={{ color: barColor, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {pct === null ? `${deck.totalCards} cards` : `${deck.known}/${deck.totalCards}`}
                      </Typography>
                      <DeleteOutlined
                        className="del"
                        onClick={e => remove(deck.id, e)}
                        sx={{ fontSize: 15, color: '#444', opacity: 0, transition: 'opacity 0.15s, color 0.15s', '&:hover': { color: '#ef5350' } }}
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct ?? 0}
                    sx={{
                      height: 3, borderRadius: 2, bgcolor: '#1c1c20',
                      '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 2 },
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
