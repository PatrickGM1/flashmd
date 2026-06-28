import { useState } from 'react'
import { Box, Typography, Button, Checkbox, TextField, InputAdornment } from '@mui/material'
import { ArrowBackOutlined, ReplayOutlined, PlayArrowRounded } from '@mui/icons-material'
import { Deck, Card } from '../types'
import { shuffleCards } from '../utils/parser'
import Shell, { Brand } from './Shell'

interface Props {
  deck: Deck
  onStart: (cards: Card[]) => void
  onBack: () => void
}

export default function ChapterSelector({ deck, onStart, onBack }: Props) {
  const chapters = deck.chapters
  const progress = deck.progress
  const [selected, setSelected] = useState<Set<number>>(new Set(chapters.map((_, i) => i)))
  const [randomCount, setRandomCount] = useState<string>('')

  const allCards = chapters.flatMap(ch => ch.cards)
  const wrongSet = new Set(progress?.unknown ?? [])
  const wrongCards = allCards.filter(c => wrongSet.has(c.question))

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
      right={<Brand />}
    >
      <Typography variant="h5" mb={0.5}>Study session</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        {allCards.length} cards across {chapters.length} chapters.
      </Typography>

      {/* Wrong cards shortcut */}
      {wrongCards.length > 0 && (
        <Box
          onClick={() => onStart(shuffleCards(wrongCards))}
          sx={{
            mb: 4, p: 2, borderRadius: 2,
            border: '1px solid rgba(239,83,80,0.22)',
            bgcolor: 'rgba(239,83,80,0.05)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'background 0.15s',
            '&:hover': { bgcolor: 'rgba(239,83,80,0.09)' },
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <ReplayOutlined sx={{ color: '#ef5350', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight={600} color="#ef5350">
                Review {wrongCards.length} wrong cards
              </Typography>
              <Typography variant="caption" color="text.secondary">
                from {progress?.lastStudied}
              </Typography>
            </Box>
          </Box>
          <ArrowBackOutlined sx={{ color: '#ef5350', fontSize: 16, transform: 'rotate(180deg)' }} />
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

      <Box border="1px solid" borderColor="divider" borderRadius={2} overflow="hidden" mb={3}>
        {chapters.map((ch, i) => {
          const active = selected.has(i)
          return (
            <Box
              key={i}
              onClick={() => toggleChapter(i)}
              sx={{
                display: 'flex', alignItems: 'center', px: 1.5, py: 1.25,
                borderTop: i === 0 ? 'none' : '1px solid',
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
                sx={{ p: 0.5, mr: 1, color: '#383840', '&.Mui-checked': { color: 'primary.main' } }}
                onClick={e => e.stopPropagation()}
                onChange={() => toggleChapter(i)}
              />
              <Typography variant="body2" flex={1} color={active ? 'text.primary' : 'text.secondary'}>
                {ch.title}
              </Typography>
              <Typography variant="caption" color="#55555c" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {ch.cards.length}
              </Typography>
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
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(255,255,255,0.015)',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: '#7c6af7' },
          },
        }}
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
