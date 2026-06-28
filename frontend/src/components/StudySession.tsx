import { useEffect, useState } from 'react'
import { Box, Typography, Button, LinearProgress, IconButton } from '@mui/material'
import { ArrowBackOutlined, UndoRounded } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, Grade, GradedCard } from '../types'
import Shell from './Shell'

interface Props {
  cards: Card[]
  onDone: (entries: GradedCard[]) => void
  onBack: () => void
}

const GRADES: { grade: Grade; label: string; cap: string; color: string; edge: string }[] = [
  { grade: 'AGAIN', label: 'Again', cap: '1', color: '#ef5e4e', edge: '#7a2e25' },
  { grade: 'HARD', label: 'Hard', cap: '2', color: '#e8b13a', edge: '#7a5e1c' },
  { grade: 'GOOD', label: 'Good', cap: '3', color: '#5fcf6a', edge: '#2f6b34' },
  { grade: 'EASY', label: 'Easy', cap: '4', color: '#7c6af7', edge: '#4b3fad' },
]

export default function StudySession({ cards, onDone, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [history, setHistory] = useState<GradedCard[]>([])

  const card = cards[index]
  const progress = ((index + (flipped ? 0.5 : 0)) / cards.length) * 100
  const correct = history.filter(h => h.grade !== 'AGAIN').length
  const missed = history.length - correct

  const grade = (g: Grade) => {
    const next = [...history, { card, grade: g }]
    if (index + 1 >= cards.length) {
      onDone(next)
      return
    }
    setHistory(next)
    setFlipped(false)
    setIndex(i => i + 1)
  }

  const undo = () => {
    if (history.length === 0) return
    setHistory(h => h.slice(0, -1))
    setIndex(i => Math.max(0, i - 1))
    setFlipped(true)
  }

  const quit = () => {
    if (history.length === 0 || window.confirm('Quit this session? Progress so far will not be saved.')) {
      onBack()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { quit(); return }
      if (e.key === 'u' || e.key === 'U' || e.key === 'Backspace') { e.preventDefault(); undo(); return }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f); return }
      if (flipped) {
        const hit = GRADES.find(g => g.cap === e.key)
        if (hit) grade(hit.grade)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <Shell
      fill
      left={
        <IconButton size="small" onClick={quit} sx={{ ml: -0.5, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <ArrowBackOutlined fontSize="small" />
        </IconButton>
      }
      right={
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1.25} sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 13 }}>
            <Box component="span" sx={{ color: '#5fcf6a' }}>{correct}</Box>
            <Box component="span" sx={{ color: '#ef5e4e' }}>{missed}</Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            {index + 1} <span style={{ color: '#46464c' }}>/ {cards.length}</span>
          </Typography>
        </Box>
      }
    >
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4, borderRadius: 0,
          '& .MuiLinearProgress-bar': { bgcolor: '#7c6af7', transition: 'transform 0.3s ease' },
        }}
      />

      <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" px={{ xs: 2.5, sm: 4 }} py={4}>
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <Typography variant="caption" sx={{ color: '#55555c', letterSpacing: '0.06em', fontWeight: 600 }}>
            {card.chapterTitle}
          </Typography>
          {history.length > 0 && (
            <Button
              size="small"
              startIcon={<UndoRounded sx={{ fontSize: 15 }} />}
              onClick={undo}
              sx={{ minWidth: 0, py: 0, px: 1, color: '#55555c', fontSize: 12, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
            >
              undo
            </Button>
          )}
        </Box>

        {/* Card */}
        <Box
          onClick={() => setFlipped(f => !f)}
          sx={{ width: '100%', maxWidth: 620, perspective: '1500px', cursor: 'pointer', mb: 4 }}
        >
          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: 280, sm: 340 },
              transformStyle: 'preserve-3d',
              transition: 'transform 0.45s cubic-bezier(0.4, 0.1, 0.2, 1)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <Face sx={{ bgcolor: '#141416', border: '1px solid #2a2a2e' }}>
              <Box
                aria-hidden
                sx={{
                  position: 'absolute', top: 14, left: 20,
                  fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600,
                  fontSize: 56, lineHeight: 1, color: 'rgba(255,255,255,0.035)',
                  fontVariantNumeric: 'tabular-nums', userSelect: 'none',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Box>
              <Typography variant="h5" fontWeight={600} textAlign="center" color="text.primary" lineHeight={1.45} sx={{ letterSpacing: '-0.01em', position: 'relative' }}>
                {card.question}
              </Typography>
              <Hint>space or click to flip</Hint>
            </Face>
            {/* Back */}
            <Face back sx={{ bgcolor: '#101011', border: '1px solid #2a2a2e' }}>
              <Box
                sx={{
                  width: '100%', color: '#d2d2d6', fontSize: 16, lineHeight: 1.75,
                  textAlign: 'center', overflowY: 'auto', maxHeight: '100%',
                  '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                  '& ul, & ol': { textAlign: 'left', m: 0, pl: 3 },
                  '& li': { mb: 0.5 },
                  '& code': { fontFamily: '"IBM Plex Mono", monospace', fontSize: 14, bgcolor: 'rgba(124,106,247,0.12)', color: '#b3a6fb', px: 0.6, py: 0.2, borderRadius: '4px' },
                  '& pre': { textAlign: 'left', bgcolor: '#16161a', p: 1.5, borderRadius: '8px', overflowX: 'auto' },
                  '& pre code': { bgcolor: 'transparent', color: '#d2d2d6', p: 0 },
                  '& strong': { color: '#fff', fontWeight: 600 },
                  '& a': { color: '#9a8cf9' },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.answer}</ReactMarkdown>
              </Box>
              <Hint>answer</Hint>
            </Face>
          </Box>
        </Box>

        {/* Grade buttons */}
        <Box width="100%" maxWidth={560}>
          <Box display="flex" gap={1}>
            {GRADES.map(g => (
              <GradeButton key={g.grade} label={g.label} cap={g.cap} color={g.color} edge={g.edge} disabled={!flipped} onClick={() => grade(g.grade)} />
            ))}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1.5, color: '#56565e' }}>
            {flipped ? 'press 1 to 4, or U to undo' : 'press space to flip'}
          </Typography>
        </Box>
      </Box>
    </Shell>
  )
}

function Face({ children, sx, back }: { children: React.ReactNode; sx?: object; back?: boolean }) {
  return (
    <Box
      sx={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : 'none',
        borderRadius: '18px',
        boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
        p: { xs: 3.5, sm: 5 },
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

function GradeButton({ label, cap, color, edge, disabled, onClick }: {
  label: string; cap: string; color: string; edge: string; disabled: boolean; onClick: () => void
}) {
  return (
    <Button
      fullWidth
      onClick={onClick}
      disabled={disabled}
      sx={{
        py: 1.1, fontWeight: 600, fontSize: 14, borderRadius: '12px',
        flexDirection: 'column', gap: 0.3,
        color: '#fff', bgcolor: color, boxShadow: `0 3px 0 ${edge}`,
        '&:hover': { bgcolor: color, filter: 'brightness(1.08)', boxShadow: `0 3px 0 ${edge}` },
        '&:active': { transform: 'translateY(3px)', boxShadow: `0 0 0 ${edge}` },
        '&.Mui-disabled': { bgcolor: '#1e1e22', color: '#3c3c44', boxShadow: 'none' },
        '&.Mui-disabled .keycap': { color: '#34343c', borderColor: '#2a2a30' },
        transition: 'transform 0.04s ease, box-shadow 0.04s ease, filter 0.12s',
      }}
    >
      {label}
      <Box
        component="span"
        className="keycap"
        sx={{
          fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, fontWeight: 600,
          color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: '4px', px: 0.5, lineHeight: 1.4,
        }}
      >
        {cap}
      </Box>
    </Button>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="caption" sx={{ position: 'absolute', bottom: 16, color: '#3a3a40', letterSpacing: '0.05em' }}>
      {children}
    </Typography>
  )
}
