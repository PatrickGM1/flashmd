import { useState } from 'react'
import { Box, Typography, Button, Checkbox, TextField, InputAdornment } from '@mui/material'
import { ArrowBackOutlined, PlayArrowRounded, ReplayRounded, EditOutlined } from '@mui/icons-material'
import { Deck, Card } from '../types'
import { shuffleCards } from '../utils/parser'
import { statsFor, accuracyColor, readProgress, orderForReview } from '../utils/stats'
import { resetProgress } from '../api'
import { panel, tile } from '../ui'
import Shell from './Shell'

interface Props {
  deck: Deck
  onStart: (cards: Card[]) => void
  onBack: () => void
  onEdit: () => void
  onDeckChange: (deck: Deck) => void
}

export default function ChapterSelector({ deck, onStart, onBack, onEdit, onDeckChange }: Props) {
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
        <Button
          startIcon={<ArrowBackOutlined sx={{ fontSize: 18 }} />}
          onClick={onBack}
          sx={{ color: 'text.secondary', ml: -0.5, fontSize: 13, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
        >
          Decks
        </Button>
      }
      right={
        <Button
          startIcon={<EditOutlined sx={{ fontSize: 17 }} />}
          onClick={onEdit}
          sx={{ color: 'text.secondary', fontSize: 13, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
        >
          Edit
        </Button>
      }
    >
      <Typography variant="h5" mb={0.5} noWrap>{deck.label}</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {allCards.length} cards across {chapters.length} chapters.
      </Typography>

      {/* Deck totals */}
      {deckStat.done > 0 && (
        <>
          <Box display="flex" gap={1.5} mb={1.5}>
            <StatTile label="Studied" value={`${deckStat.done}/${deckStat.total}`} color="#9a8cf9" />
            <StatTile label="Correct" value={`${deckStat.correct}/${deckStat.done}`} color={accuracyColor(deckStat)} />
          </Box>
          <Box textAlign="right" mb={3}>
            <Typography
              component="span"
              variant="caption"
              onClick={reset}
              sx={{ cursor: 'pointer', color: '#6b6b73', '&:hover': { color: '#ef5e4e' } }}
            >
              Reset progress
            </Typography>
          </Box>
        </>
      )}

      {/* Due for review (spaced repetition) */}
      {dueCards.length > 0 && (
        <Box
          onClick={() => onStart(orderForReview(dueCards, progress))}
          sx={{
            ...tile,
            mb: 4,
            display: 'flex', alignItems: 'stretch', gap: 0,
            p: 0,
            overflow: 'hidden',
            '&:hover': { borderColor: '#5a4a86' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, bgcolor: '#7c6af7', color: '#0e0a1f' }}>
            <ReplayRounded sx={{ fontSize: 24 }} />
          </Box>
          <Box flex={1} py={1.5} px={2}>
            <Typography fontWeight={600} fontSize={14.5} color="text.primary">
              Due for review
            </Typography>
            <Typography variant="caption" color="text.secondary">
              weakest cards first{progress?.lastStudied ? `, last studied ${progress.lastStudied}` : ''}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" pr={2}>
            <Box
              sx={{
                fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, fontSize: 15,
                color: '#9a8cf9', minWidth: 30, textAlign: 'center', py: 0.25, borderRadius: '7px',
                border: '1.5px solid #3a3460', bgcolor: 'rgba(124,106,247,0.1)',
              }}
            >
              {dueCards.length}
            </Box>
          </Box>
        </Box>
      )}


      {/* Chapters */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 600 }}>
          Chapters
        </Typography>
        <Typography
          variant="caption"
          onClick={() => setSelected(allSelected ? new Set() : new Set(chapters.map((_, i) => i)))}
          sx={{ cursor: 'pointer', color: 'text.secondary', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
        >
          {allSelected ? 'Clear' : 'Select all'}
        </Typography>
      </Box>

      <Box sx={{ ...panel, overflow: 'hidden', mb: 3 }}>
        {chapters.map((ch, i) => {
          const active = selected.has(i)
          const stat = statsFor(ch.cards, knownSet, wrongSet)
          return (
            <Box
              key={i}
              onClick={() => toggleChapter(i)}
              sx={{
                display: 'flex', alignItems: 'center', px: 1.5, py: 1.25,
                borderTop: i === 0 ? 'none' : '1.5px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'background 0.1s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.018)' },
              }}
            >
              <Checkbox
                checked={active}
                size="small"
                disableRipple
                sx={{ p: 0.5, mr: 0.5, color: '#383840', '&.Mui-checked': { color: 'primary.main' } }}
                onClick={e => e.stopPropagation()}
                onChange={() => toggleChapter(i)}
              />
              <Typography
                component="span"
                sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: active ? '#9a8cf9' : '#46464c', width: 24, flexShrink: 0, fontWeight: 600 }}
              >
                {String(i + 1).padStart(2, '0')}
              </Typography>
              <Typography variant="body2" flex={1} color={active ? 'text.primary' : 'text.secondary'}>
                {ch.title}
              </Typography>
              {stat.done > 0 ? (
                <Box display="flex" alignItems="center" gap={1.25} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  <Typography variant="caption" sx={{ color: accuracyColor(stat), fontWeight: 600 }}>
                    {stat.correct}/{stat.done} correct
                  </Typography>
                  <Typography variant="caption" color="#55555c">
                    {stat.done}/{stat.total} done
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="#55555c" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {ch.cards.length} cards
                </Typography>
              )}
            </Box>
          )
        })}
      </Box>

      {/* Random N */}
      <TextField
        fullWidth
        size="small"
        type="number"
        placeholder={`Limit to N cards (empty = all ${totalCards})`}
        value={randomCount}
        onChange={e => setRandomCount(e.target.value)}
        inputProps={{ min: 1, max: totalCards }}
        InputProps={{
          endAdornment: randomCount ? (
            <InputAdornment position="end">
              <Typography variant="caption" color="text.secondary">/ {totalCards}</Typography>
            </InputAdornment>
          ) : undefined,
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        variant="contained"
        size="large"
        disabled={selected.size === 0}
        onClick={handleStart}
        endIcon={<PlayArrowRounded />}
        sx={{ py: 1.4, fontWeight: 600, fontSize: 15 }}
      >
        Start {totalCards} cards
      </Button>
    </Shell>
  )
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Box sx={{ ...panel, flex: 1, px: 2, py: 1.5 }}>
      <Typography
        sx={{
          fontFamily: '"Fredoka", sans-serif', fontWeight: 600, fontSize: 22,
          color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.04em' }}>
        {label}
      </Typography>
    </Box>
  )
}
