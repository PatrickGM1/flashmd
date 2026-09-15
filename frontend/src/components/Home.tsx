import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Button, Alert, CircularProgress, IconButton, useTheme } from '@mui/material'
import { DeleteOutlined, DriveFileRenameOutlineOutlined, AddRounded, ArrowBackOutlined } from '@mui/icons-material'
import { Activity, Card, Deck, DeckSummary } from '../types'
import { listDecks, getDeck, createDeck, deleteDeck, renameDeck, getActivity } from '../api'
import { ink, table, accuracyOnTable, CARD_RATIO } from '../ui'
import { readProgress, orderForReview } from '../utils/stats'
import { fonts } from '../theme'
import Shell, { Brand } from './Shell'
import { CardBack, Chip } from './cards'

interface Props {
  onOpenDeck: (deck: Deck) => void
  onStudyAll: (cards: Card[], deckMap: Map<Card, string>) => void
  /** admin only: show this player's table instead of your own */
  viewing?: { id: string; username: string }
  onLeaveViewing?: () => void
}

export default function Home({ onOpenDeck, onStudyAll, viewing, onLeaveViewing }: Props) {
  const owner = viewing?.id
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [activity, setActivity] = useState<Activity | null>(null)
  const t = table[useTheme().palette.mode]

  const refresh = () => {
    listDecks(owner)
      .then(setDecks)
      .catch(() => setError('Cannot reach the server. Is the backend running on :8080?'))
      .finally(() => setLoadingList(false))
    getActivity(owner).then(setActivity).catch(() => {})
  }

  useEffect(refresh, [owner])

  const totalDue = decks.reduce((s, d) => s + d.due, 0)

  const studyAllDue = async () => {
    setBusy(true)
    try {
      const cards: Card[] = []
      const map = new Map<Card, string>()
      for (const summary of decks) {
        if (summary.due === 0) continue
        const full = await getDeck(summary.id)
        const { due } = readProgress(full.progress)
        for (const ch of full.chapters) {
          for (const c of ch.cards) {
            if (due.has(c.question)) { cards.push(c); map.set(c, full.id) }
          }
        }
      }
      if (cards.length > 0) onStudyAll(orderForReview(cards, null), map)
    } finally {
      setBusy(false)
    }
  }

  const rename = async (id: string, current: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const name = window.prompt('Rename deck', current)
    if (!name || name.trim() === current) return
    setDecks(d => d.map(x => x.id === id ? { ...x, label: name.trim() } : x))
    try { await renameDeck(id, name.trim()) } catch { refresh() }
  }

  const upload = async (label: string, content: string) => {
    setBusy(true)
    setError(null)
    try {
      onOpenDeck(await createDeck(label, content, owner))
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

  const uploadSlot = (
    <Box
      component="button"
      type="button"
      onClick={() => !busy && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      disabled={busy}
      aria-label="Add a deck: drop a markdown file or click to browse"
      sx={{
        aspectRatio: CARD_RATIO, width: '100%',
        borderRadius: '12px',
        border: '2px dashed',
        borderColor: dragging ? t.blueText : t.rule,
        bgcolor: dragging ? t.hover : 'transparent',
        color: dragging ? t.blueText : t.muted,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        cursor: busy ? 'default' : 'pointer',
        opacity: busy ? 0.6 : 1,
        fontFamily: fonts.ui,
        transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s',
        '&:hover:not(:disabled)': { borderColor: t.text, color: t.text },
      }}
    >
      <AddRounded sx={{ fontSize: 34 }} />
      <Box sx={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>Add a deck</Box>
      <Box sx={{ fontSize: 12.5, opacity: 0.85 }}>drop a .md or click</Box>
    </Box>
  )

  return (
    <Shell
      maxWidth="md"
      left={viewing ? (
        <Button startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />} onClick={onLeaveViewing} sx={{ ml: -0.5, fontSize: 13 }}>Accounts</Button>
      ) : <Brand />}
      right={
        <Box display="flex" alignItems="center" gap={1.5}>
          {activity && activity.streak > 0 && (
            <Box display="flex" alignItems="center" gap={0.75} title={`${activity.streak}-day streak, ${activity.today} cards today`}>
              <Chip color={ink.blue} edge={ink.blueEdge} size={26} sx={{ fontSize: 12 }}>{activity.streak}</Chip>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>day streak</Typography>
            </Box>
          )}
          <Button size="small" onClick={handleExample} disabled={busy} sx={{ fontSize: 13, display: { xs: 'none', sm: 'inline-flex' } }}>
            {busy ? <CircularProgress size={13} color="inherit" sx={{ mr: 1 }} /> : null}
            Example deck
          </Button>
        </Box>
      }
    >
      <input ref={fileInputRef} type="file" accept=".md,text/plain" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      <Box display="flex" alignItems="flex-end" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1 }}>
            {viewing ? `${viewing.username}'s table` : 'On the table'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.75}>
            {loadingList
              ? 'Dealing…'
              : decks.length === 0
                ? 'No decks yet. Add a markdown file to start.'
                : totalDue > 0
                  ? `${totalDue} ${totalDue === 1 ? 'card' : 'cards'} due across ${decks.length} ${decks.length === 1 ? 'deck' : 'decks'}.`
                  : `Nothing due. ${decks.length} ${decks.length === 1 ? 'deck' : 'decks'} ready.`}
          </Typography>
        </Box>
        {totalDue > 0 && (
          <Button variant="contained" onClick={studyAllDue} disabled={busy} sx={{ px: 2.5, py: 1.1, fontSize: 15 }}>
            Study all due · {totalDue}
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
          gap: { xs: 2, sm: 3 },
        }}
      >
        {decks.map(deck => {
          const done = deck.known + deck.unknown
          const accColor = accuracyOnTable(deck.known, done, t)
          return (
            <Box key={deck.id} sx={{ '&:hover .tools, &:focus-within .tools': { opacity: 1 } }}>
              <Box
                component="button"
                type="button"
                onClick={() => open(deck.id)}
                disabled={busy}
                aria-label={`Open ${deck.label}${deck.due ? `, ${deck.due} due` : ''}`}
                sx={{
                  position: 'relative',
                  display: 'block', width: '100%', p: 0, border: 'none', bgcolor: 'transparent', borderRadius: '12px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'transform 0.15s ease',
                  '&:hover:not(:disabled)': { transform: 'translateY(-4px) rotate(-1deg)' },
                  '&:hover:not(:disabled) .back': { boxShadow: '0 1px 0 rgba(0,0,0,0.12), 0 14px 24px -8px rgba(0,0,0,0.35)' },
                }}
              >
                <CardBack seed={deck.label} sx={{ transition: 'box-shadow 0.15s ease' }}>
                  {/* name ribbon */}
                  <Box
                    sx={{
                      position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)',
                      bgcolor: 'background.paper', color: ink.card,
                      px: 1.5, py: 1,
                      borderTop: `1.5px solid ${ink.cardRule}`, borderBottom: `1.5px solid ${ink.cardRule}`,
                    }}
                  >
                    <Typography noWrap sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: { xs: 17, sm: 19 }, lineHeight: 1.15, letterSpacing: '0.01em' }}>
                      {deck.label}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 12, color: ink.cardMuted, fontVariantNumeric: 'tabular-nums' }}>
                      {deck.totalCards} cards
                    </Typography>
                  </Box>
                </CardBack>
                {deck.due > 0 && (
                  <Chip color={ink.again} edge="#7f0a1d" size={34} title={`${deck.due} due`} sx={{ position: 'absolute', top: -10, right: -10, fontSize: 14 }}>
                    {deck.due}
                  </Chip>
                )}
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between" mt={1} minHeight={28}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: accColor, fontVariantNumeric: 'tabular-nums' }}>
                  {done === 0 ? 'Not studied' : `${deck.known}/${done} correct`}
                </Typography>
                <Box className="tools" display="flex" sx={{ opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.15s' }}>
                  <IconButton size="small" aria-label={`Rename ${deck.label}`} onClick={e => rename(deck.id, deck.label, e)} sx={{ p: 0.5 }}>
                    <DriveFileRenameOutlineOutlined sx={{ fontSize: 17 }} />
                  </IconButton>
                  <IconButton size="small" aria-label={`Delete ${deck.label}`} onClick={e => remove(deck.id, e)} sx={{ p: 0.5, '&:hover': { color: t.redText } }}>
                    <DeleteOutlined sx={{ fontSize: 17 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )
        })}

        {!loadingList && <Box>{uploadSlot}</Box>}
      </Box>

      {!loadingList && (
        <Box mt={2.5} sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Button size="small" onClick={handleExample} disabled={busy} sx={{ fontSize: 13, ml: -1 }}>
            {busy ? <CircularProgress size={13} color="inherit" sx={{ mr: 1 }} /> : null}
            Try the example deck
          </Button>
        </Box>
      )}
    </Shell>
  )
}
