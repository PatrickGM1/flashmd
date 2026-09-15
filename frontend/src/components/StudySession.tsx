import { useEffect, useState } from 'react'
import { Box, Typography, Button, IconButton, useTheme } from '@mui/material'
import { ArrowBackOutlined, UndoRounded } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, Grade, GradedCard } from '../types'
import { ink, table, gradeInk, gradeEdge, stock, CARD_RATIO } from '../ui'
import { fonts } from '../theme'
import Shell from './Shell'
import { CardBack, Chip, Index } from './cards'

interface Props {
  cards: Card[]
  onDone: (entries: GradedCard[]) => void
  onBack: () => void
}

const GRADES: { grade: Grade; label: string; cap: string }[] = [
  { grade: 'AGAIN', label: 'Again', cap: '1' },
  { grade: 'HARD', label: 'Hard', cap: '2' },
  { grade: 'GOOD', label: 'Good', cap: '3' },
  { grade: 'EASY', label: 'Easy', cap: '4' },
]

export default function StudySession({ cards, onDone, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [history, setHistory] = useState<GradedCard[]>([])
  const t = table[useTheme().palette.mode]

  const card = cards[index]
  const correct = history.filter(h => h.grade !== 'AGAIN').length
  const missed = history.length - correct
  const remaining = cards.length - index - 1

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
        <IconButton size="small" onClick={quit} aria-label="Quit session" sx={{ ml: -0.5 }}>
          <ArrowBackOutlined fontSize="small" />
        </IconButton>
      }
      right={
        <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 20, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {index + 1}<Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}> / {cards.length}</Box>
        </Typography>
      }
    >
      {/* one key per card, lit in its grade color; scales, never wraps */}
      <Box
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cards.length}
        aria-valuenow={index}
        aria-label="Session progress"
        sx={{ display: 'flex', gap: cards.length > 60 ? '1px' : '3px', px: { xs: 2, sm: 3 }, height: 6, flexShrink: 0 }}
      >
        {cards.map((_, i) => {
          const g = history[i]?.grade
          const current = i === index
          return (
            <Box
              key={i}
              sx={{
                flex: 1, minWidth: 0, borderRadius: 1,
                bgcolor: g ? gradeInk[g] : current ? t.text : t.rule,
                opacity: g || current ? 1 : 0.6,
                transition: 'background-color 0.2s ease',
              }}
            />
          )
        })}
      </Box>

      <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" px={{ xs: 2, sm: 4 }} pt={{ xs: 1.5, sm: 2 }} pb={{ xs: 1, sm: 2 }} minHeight={0} gap={{ xs: 1.5, sm: 2.5 }}>
        {/* the rest of the deck, face down: where the next card is dealt from */}
        <Box
          aria-label={`${remaining} ${remaining === 1 ? 'card' : 'cards'} left in the deck`}
          sx={{ position: 'relative', width: { xs: 52, sm: 60 }, flexShrink: 0, mb: { xs: 0.5, sm: 1 }, opacity: remaining === 0 ? 0.35 : 1, transition: 'opacity 0.3s' }}
        >
          {[2, 1, 0].map(i => (
            <CardBack
              key={i}
              mini
              seed={card.chapterTitle}
              sx={{
                position: i === 0 ? 'relative' : 'absolute', inset: 0,
                transform: `translate(${i * 2}px, ${i * 2}px)`,
                borderRadius: '6px',
                boxShadow: '0 1px 0 rgba(0,0,0,0.12), 0 3px 6px -2px rgba(0,0,0,0.25)',
                opacity: remaining > i ? 1 : 0,
              }}
            />
          ))}
        </Box>

        {/* The card: a true poker card, portrait on both viewports */}
        <Box
          component="button"
          type="button"
          onClick={() => setFlipped(f => !f)}
          aria-label={flipped ? 'Show question' : 'Show answer'}
          aria-pressed={flipped}
          tabIndex={-1}
          sx={{
            width: { xs: 'min(100%, calc((100dvh - 320px) * 63 / 88))', sm: 'min(100%, calc((100dvh - 400px) * 63 / 88))' },
            maxWidth: 480,
            aspectRatio: CARD_RATIO,
            perspective: '1600px', cursor: 'pointer',
            border: 'none', bgcolor: 'transparent', p: 0, textAlign: 'inherit', color: 'inherit', font: 'inherit',
            flexShrink: 0,
          }}
        >
          <Box
            key={index}
            sx={{
              position: 'relative', width: '100%', height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.45s cubic-bezier(0.4, 0.1, 0.2, 1)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              animation: 'deal 0.26s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* Front */}
            <Face>
              <Index size={28}>{index + 1}</Index>
              <Index corner="br" size={28}>{index + 1}</Index>
              <Typography
                component="p"
                sx={{
                  fontFamily: fonts.ui, fontWeight: 600, textAlign: 'center', lineHeight: 1.3,
                  fontSize: { xs: 22, sm: 26 }, letterSpacing: '-0.005em', textWrap: 'balance', m: 0,
                  overflowY: 'auto', maxHeight: '100%', width: '100%',
                }}
              >
                {card.question}
              </Typography>
              <Foot>{card.chapterTitle}</Foot>
            </Face>
            {/* Back */}
            <Face back>
              <Index color={ink.blue} size={28}>{index + 1}</Index>
              <Index corner="br" color={ink.blue} size={28}>{index + 1}</Index>
              <Box
                sx={{
                  width: '100%', fontSize: { xs: 16, sm: 17 }, lineHeight: 1.6,
                  textAlign: 'center', overflowY: 'auto', maxHeight: '100%',
                  '& p': { m: 0, mb: 1.25, '&:last-child': { mb: 0 } },
                  '& ul, & ol': { textAlign: 'left', m: 0, mb: 1.25, pl: 3 },
                  '& li': { mb: 0.5 },
                  '& code': { fontFamily: fonts.mono, fontSize: '0.88em', bgcolor: '#eef1f7', color: ink.blue, px: 0.6, py: 0.2, borderRadius: '4px' },
                  '& pre': { textAlign: 'left', bgcolor: '#f1f0ec', border: `1px solid ${ink.cardRule}`, p: 1.5, mb: 1.25, borderRadius: '8px', overflowX: 'auto' },
                  '& pre code': { bgcolor: 'transparent', color: ink.card, p: 0 },
                  '& strong': { fontWeight: 700 },
                  '& a': { color: ink.blue },
                  '& table': { borderCollapse: 'collapse', mx: 'auto', mb: 1.25 },
                  '& th, & td': { border: `1px solid ${ink.cardRule}`, px: 1, py: 0.5 },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.answer}</ReactMarkdown>
              </Box>
              <Foot>{card.chapterTitle}</Foot>
            </Face>
          </Box>
        </Box>

        {/* Chips: exist only once the card is flipped; before that, the flip hint sits in their place */}
        <Box sx={{ position: 'relative', minHeight: 96, width: '100%', flexShrink: 0 }}>
          <Typography
            aria-hidden={flipped}
            sx={{
              position: 'absolute', left: 0, right: 0, top: 24, textAlign: 'center',
              fontSize: 14, color: 'text.secondary',
              transition: 'opacity 0.15s ease', opacity: flipped ? 0 : 1,
            }}
          >
            Tap the card or press Space to flip
          </Typography>
          <Box
            sx={{
              display: 'flex', gap: { xs: 2, sm: 3.5 }, alignItems: 'flex-start', justifyContent: 'center',
              transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.15s ease',
              transform: flipped ? 'none' : 'translateY(14px)',
              opacity: flipped ? 1 : 0,
              pointerEvents: flipped ? 'auto' : 'none',
            }}
            aria-hidden={!flipped}
          >
            {GRADES.map(g => (
              <Box key={g.grade} display="flex" flexDirection="column" alignItems="center" gap={0.75}>
                <Chip
                  color={gradeInk[g.grade]}
                  edge={gradeEdge[g.grade]}
                  size={64}
                  label={`${g.label} (${g.cap})`}
                  onClick={() => grade(g.grade)}
                  disabled={!flipped}
                  tabIndex={flipped ? 0 : -1}
                >
                  {g.cap}
                </Chip>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1 }}>{g.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* corner readouts: tally bottom-left, undo bottom-right */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={{ xs: 2, sm: 3 }} pb={{ xs: 2, sm: 2.5 }} flexShrink={0}>
        <Box display="flex" alignItems="center" gap={1.25} aria-label={`${correct} correct, ${missed} missed`}>
          <Box display="flex" alignItems="center" gap={0.6}>
            <Chip color={ink.good} edge={gradeEdge.GOOD} size={22} />
            <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 18, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{correct}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.6}>
            <Chip color={ink.again} edge={gradeEdge.AGAIN} size={22} />
            <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 18, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{missed}</Typography>
          </Box>
        </Box>
        <Button
          size="small"
          startIcon={<UndoRounded sx={{ fontSize: 16 }} />}
          onClick={undo}
          disabled={history.length === 0}
          sx={{ fontSize: 13, '&.Mui-disabled': { color: t.muted, opacity: 0.5 } }}
        >
          Undo
        </Button>
      </Box>
    </Shell>
  )
}

function Face({ children, back }: { children: React.ReactNode; back?: boolean }) {
  return (
    <Box
      sx={{
        ...stock,
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : 'none',
        p: { xs: '48px 26px 44px', sm: '56px 40px 48px' },
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  )
}

/** Small plain line at the foot of a face: the chapter this card belongs to. */
function Foot({ children }: { children: React.ReactNode }) {
  return (
    <Typography noWrap sx={{ position: 'absolute', bottom: 16, left: 52, right: 52, textAlign: 'center', fontSize: 12.5, color: ink.cardMuted }}>
      {children}
    </Typography>
  )
}
