import { useState } from 'react'
import { Box, Typography, Button, TextField, InputAdornment, useTheme } from '@mui/material'
import { ArrowBackOutlined, EditOutlined, PlayArrowRounded } from '@mui/icons-material'
import { Deck, Card } from '../types'
import { shuffleCards } from '../utils/parser'
import { statsFor, readProgress, orderForReview } from '../utils/stats'
import { resetProgress } from '../api'
import { ink, table, accuracyColor, accuracyOnTable, stock } from '../ui'
import { fonts } from '../theme'
import Shell from './Shell'
import { Chip } from './cards'

interface Props {
  deck: Deck
  onStart: (cards: Card[]) => void
  onBack: () => void
  onEdit: () => void
  onDeckChange: (deck: Deck) => void
}

export default function ChapterSelector({ deck, onStart, onBack, onEdit, onDeckChange }: Props) {
  const t = table[useTheme().palette.mode]
  const reset = async () => {
    if (!window.confirm('Reset all progress for this deck?')) return
    try { onDeckChange(await resetProgress(deck.id)) } catch { /* ignore */ }
  }

  const chapters = deck.chapters
  const progress = deck.progress
  const [selected, setSelected] = useState<Set<number>>(new Set(chapters.map((_, i) => i)))
  const [randomCount, setRandomCount] = useState<string>('')

  const allCards = chapters.flatMap(ch => ch.cards)
  const { known: knownSet, wrong: wrongSet, due: dueSet } = readProgress(progress)
  const dueCards = allCards.filter(c => dueSet.has(c.question))
  const deckStat = statsFor(allCards, knownSet, wrongSet)

  const allSelected = selected.size === chapters.length
  const totalCards = chapters.filter((_, i) => selected.has(i)).reduce((s, ch) => s + ch.cards.length, 0)
  const n = parseInt(randomCount)
  const dealCount = Number.isFinite(n) && n > 0 && n < totalCards ? n : totalCards

  const toggleChapter = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleStart = () => {
    const pool = chapters.filter((_, i) => selected.has(i)).flatMap(ch => ch.cards)
    const shuffled = shuffleCards(pool)
    const n = parseInt(randomCount)
    onStart(Number.isFinite(n) && n > 0 && n < shuffled.length ? shuffled.slice(0, n) : shuffled)
  }

  return (
    <Shell
      left={
        <Button startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />} onClick={onBack} sx={{ ml: -0.5, fontSize: 13 }}>
          All decks
        </Button>
      }
      right={
        <Button startIcon={<EditOutlined sx={{ fontSize: 17 }} />} onClick={onEdit} sx={{ fontSize: 13 }}>
          Edit
        </Button>
      }
    >
      <Typography variant="h4" sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1.05, overflowWrap: 'anywhere' }}>
        {deck.label}
      </Typography>
      <Box display="flex" alignItems="center" flexWrap="wrap" gap="4px 14px" mt={0.75} mb={3}>
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {allCards.length} cards · {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
        </Typography>
        {deckStat.done > 0 && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, color: accuracyOnTable(deckStat.correct, deckStat.done, t), fontVariantNumeric: 'tabular-nums' }}>
              {deckStat.correct}/{deckStat.done} correct
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {deckStat.done}/{deckStat.total} studied
            </Typography>
            <Button size="small" onClick={reset} sx={{ fontSize: 12.5, minWidth: 0, p: '2px 6px', ml: 'auto', '&:hover': { color: t.redText } }}>
              Reset progress
            </Button>
          </>
        )}
      </Box>

      {/* Due for review: a face-up card with a red index */}
      {dueCards.length > 0 && (
        <Box
          component="button"
          type="button"
          onClick={() => onStart(orderForReview(dueCards, progress))}
          sx={{
            ...stock, width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit',
            display: 'flex', alignItems: 'center', gap: 2,
            px: 2.5, py: 2, mb: 3, minHeight: 84,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 1px 0 rgba(0,0,0,0.12), 0 14px 24px -8px rgba(0,0,0,0.35)' },
          }}
        >
          <Box sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 40, lineHeight: 1, color: ink.red, minWidth: 44, fontVariantNumeric: 'tabular-nums' }}>
            {dueCards.length}
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}>
              Due for review
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: ink.cardMuted, mt: 0.25 }}>
              Weakest cards first{progress?.lastStudied ? ` · last studied ${progress.lastStudied}` : ''}
            </Typography>
          </Box>
          <Chip color={ink.blue} edge={ink.blueEdge} size={40}><PlayArrowRounded sx={{ fontSize: 22, display: 'block' }} /></Chip>
        </Box>
      )}

      {/* Chapters: cut the deck */}
      <Box display="flex" alignItems="baseline" justifyContent="space-between" mb={1.25}>
        <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 20 }}>
          Cut the deck
        </Typography>
        <Button size="small" onClick={() => setSelected(allSelected ? new Set() : new Set(chapters.map((_, i) => i)))} sx={{ fontSize: 13, minWidth: 0, px: 1 }}>
          {allSelected ? 'Clear all' : 'Select all'}
        </Button>
      </Box>

      <Box sx={{ ...stock, mb: 3, overflow: 'hidden' }}>
        {chapters.map((ch, i) => {
          const active = selected.has(i)
          const stat = statsFor(ch.cards, knownSet, wrongSet)
          return (
            <Box
              key={i}
              component="button"
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => toggleChapter(i)}
              sx={{
                width: '100%', border: 'none', bgcolor: 'transparent', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25,
                borderTop: i === 0 ? 'none' : `1.5px solid ${ink.cardRule}`,
                transition: 'background 0.1s',
                '&:hover': { bgcolor: '#f4f2ee' },
                '&:focus-visible': { outlineOffset: -2 },
              }}
            >
              <MiniCard active={active} />
              <Typography component="span" sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 15, color: active ? ink.blue : ink.cardMuted, width: 22, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {i + 1}
              </Typography>
              <Typography component="span" sx={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500, color: active ? ink.card : ink.cardMuted, overflowWrap: 'anywhere' }}>
                {ch.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1.25} flexShrink={0} sx={{ fontVariantNumeric: 'tabular-nums', fontSize: 12.5 }}>
                {stat.done > 0 && (
                  <Box component="span" sx={{ color: accuracyColor(stat.correct, stat.done), fontWeight: 700 }}>
                    {stat.correct}/{stat.done} correct
                  </Box>
                )}
                <Box component="span" sx={{ color: ink.cardMuted }}>{ch.cards.length} cards</Box>
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box display="flex" gap={1.5} alignItems="stretch" flexWrap="wrap">
        <TextField
          size="small"
          type="number"
          label="Deal only"
          placeholder={String(totalCards)}
          value={randomCount}
          onChange={e => setRandomCount(e.target.value)}
          inputProps={{ min: 1, max: totalCards, style: { fontVariantNumeric: 'tabular-nums' } }}
          InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 13, color: ink.cardMuted }}>of {totalCards}</Typography></InputAdornment> }}
          sx={{ width: 170 }}
        />
        <Button
          variant="contained"
          size="large"
          disabled={selected.size === 0}
          onClick={handleStart}
          sx={{ flex: 1, minWidth: 180, py: 1.2, fontSize: 16 }}
        >
          Deal {dealCount} {dealCount === 1 ? 'card' : 'cards'}
        </Button>
      </Box>
    </Shell>
  )
}

/** A chapter's stack: face-up when in the deal, face-down when cut out. */
function MiniCard({ active }: { active: boolean }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 22, height: 30, flexShrink: 0, borderRadius: '3px',
        border: `1.5px solid ${active ? ink.blue : ink.cardRule}`,
        bgcolor: active ? ink.blue : '#fff',
        position: 'relative',
        transition: 'background 0.12s, border-color 0.12s',
        '&::after': {
          content: '""', position: 'absolute', inset: 3, borderRadius: '2px',
          bgcolor: active ? '#fff' : 'transparent',
          border: active ? 'none' : `1px dashed ${ink.cardRule}`,
        },
      }}
    />
  )
}
