import { useState } from 'react'
import {
  Box, Typography, Paper, Button, Checkbox, FormControlLabel,
  Divider, TextField, InputAdornment, Chip,
} from '@mui/material'
import { StyleOutlined, ShuffleOutlined, PlayArrowOutlined } from '@mui/icons-material'
import { Chapter, Card } from '../types'
import { shuffleCards } from '../utils/parser'

interface Props {
  chapters: Chapter[]
  onStart: (cards: Card[]) => void
}

export default function ChapterSelector({ chapters, onStart }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set(chapters.map((_, i) => i)))
  const [randomCount, setRandomCount] = useState<string>('')

  const allSelected = selected.size === chapters.length
  const totalCards = chapters
    .filter((_, i) => selected.has(i))
    .reduce((sum, ch) => sum + ch.cards.length, 0)

  const toggleChapter = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(chapters.map((_, i) => i)))
  }

  const handleStart = () => {
    const pool = chapters.filter((_, i) => selected.has(i)).flatMap(ch => ch.cards)
    const shuffled = shuffleCards(pool)
    const n = parseInt(randomCount)
    onStart(Number.isFinite(n) && n > 0 && n < shuffled.length ? shuffled.slice(0, n) : shuffled)
  }

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" px={2} bgcolor="background.default">
      <Box width="100%" maxWidth={520}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Box display="inline-flex" alignItems="center" justifyContent="center" sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'rgba(124,106,247,0.12)', border: '1px solid', borderColor: 'primary.main', mb: 1.5 }}>
            <StyleOutlined sx={{ color: 'primary.main', fontSize: 24 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
            flash<span style={{ color: '#7c6af7' }}>md</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Select chapters to study
          </Typography>
        </Box>

        {/* Chapter list */}
        <Paper variant="outlined" sx={{ bgcolor: 'background.paper', borderColor: '#2a2a2a', overflow: 'hidden' }}>
          {/* Select all */}
          <Box px={2} py={1.5} display="flex" alignItems="center" justifyContent="space-between" borderBottom="1px solid #2a2a2a">
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={selected.size > 0 && !allSelected}
                  onChange={toggleAll}
                  size="small"
                  sx={{ color: '#2a2a2a', '&.Mui-checked': { color: 'primary.main' }, '&.MuiCheckbox-indeterminate': { color: 'primary.main' } }}
                />
              }
              label={<Typography variant="body2" fontWeight={600} color="text.secondary">All chapters</Typography>}
              sx={{ m: 0 }}
            />
            <Chip
              label={`${totalCards} cards`}
              size="small"
              sx={{ bgcolor: 'rgba(124,106,247,0.12)', color: 'primary.main', border: '1px solid rgba(124,106,247,0.3)', fontSize: 11 }}
            />
          </Box>

          {/* Chapters */}
          {chapters.map((ch, i) => (
            <Box key={i}>
              <Box px={2} py={1.2} display="flex" alignItems="center" justifyContent="space-between" sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, cursor: 'pointer' }} onClick={() => toggleChapter(i)}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected.has(i)}
                      onChange={() => toggleChapter(i)}
                      onClick={e => e.stopPropagation()}
                      size="small"
                      sx={{ color: '#2a2a2a', '&.Mui-checked': { color: 'primary.main' } }}
                    />
                  }
                  label={<Typography variant="body2" color="text.primary">{ch.title}</Typography>}
                  sx={{ m: 0, flex: 1 }}
                />
                <Typography variant="caption" color="text.secondary">{ch.cards.length}</Typography>
              </Box>
              {i < chapters.length - 1 && <Divider sx={{ borderColor: '#1e1e1e' }} />}
            </Box>
          ))}
        </Paper>

        {/* Random N */}
        <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderColor: '#2a2a2a' }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1.5} display="flex" alignItems="center" gap={0.5}>
            <ShuffleOutlined sx={{ fontSize: 16 }} /> Random subset (optional)
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder={`All ${totalCards} cards`}
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
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0e0e0e',
                '& fieldset': { borderColor: '#2a2a2a' },
                '&:hover fieldset': { borderColor: '#7c6af7' },
              },
            }}
          />
        </Paper>

        {/* Start */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={selected.size === 0}
          onClick={handleStart}
          startIcon={<PlayArrowOutlined />}
          sx={{ mt: 2.5, py: 1.5, fontWeight: 700, fontSize: 15 }}
        >
          Start
        </Button>
      </Box>
    </Box>
  )
}
