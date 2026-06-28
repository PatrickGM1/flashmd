import { useState } from 'react'
import { Box, Typography, Button, LinearProgress, IconButton } from '@mui/material'
import { CheckRounded, CloseRounded, ArrowBackOutlined } from '@mui/icons-material'
import { Card, StudyResults } from '../types'
import Shell from './Shell'

interface Props {
  cards: Card[]
  onDone: (results: StudyResults) => void
  onBack: () => void
}

export default function StudySession({ cards, onDone, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Card[]>([])
  const [unknown, setUnknown] = useState<Card[]>([])

  const card = cards[index]
  const progress = ((index + (flipped ? 0.5 : 0)) / cards.length) * 100

  const advance = (wasKnown: boolean) => {
    const nextKnown = wasKnown ? [...known, card] : known
    const nextUnknown = wasKnown ? unknown : [...unknown, card]
    if (index + 1 >= cards.length) {
      onDone({ known: nextKnown, unknown: nextUnknown })
      return
    }
    setKnown(nextKnown)
    setUnknown(nextUnknown)
    setFlipped(false)
    setIndex(i => i + 1)
  }

  return (
    <Shell
      fill
      left={
        <IconButton size="small" onClick={onBack} sx={{ ml: -0.5, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <ArrowBackOutlined fontSize="small" />
        </IconButton>
      }
      right={
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {index + 1} <span style={{ color: '#46464c' }}>/ {cards.length}</span>
        </Typography>
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
        <Typography variant="caption" sx={{ color: '#55555c', mb: 3, letterSpacing: '0.06em', fontWeight: 600 }}>
          {card.chapterTitle}
        </Typography>

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
              <Hint>click to flip</Hint>
            </Face>
            {/* Back */}
            <Face back sx={{ bgcolor: '#101011', border: '1px solid #2a2a2e' }}>
              <Typography variant="body1" textAlign="center" color="#cfcfd2" lineHeight={1.75} sx={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>
                {card.answer}
              </Typography>
              <Hint>answer</Hint>
            </Face>
          </Box>
        </Box>

        {/* Actions */}
        <Box display="flex" gap={1.5} width="100%" maxWidth={440}>
          <ActionButton
            color="#ef5e4e" edge="#7a2e25"
            icon={<CloseRounded />} label="Missed"
            disabled={!flipped} onClick={() => advance(false)}
          />
          <ActionButton
            color="#5fcf6a" edge="#2f6b34"
            icon={<CheckRounded />} label="Knew it"
            disabled={!flipped} onClick={() => advance(true)}
          />
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

function ActionButton({ color, edge, icon, label, disabled, onClick }: {
  color: string; edge: string; icon: React.ReactNode; label: string; disabled: boolean; onClick: () => void
}) {
  return (
    <Button
      fullWidth
      startIcon={icon}
      onClick={onClick}
      disabled={disabled}
      sx={{
        py: 1.4, fontWeight: 600, fontSize: 15, borderRadius: '12px',
        color: '#fff',
        bgcolor: color,
        boxShadow: `0 3px 0 ${edge}`,
        '&:hover': { bgcolor: color, filter: 'brightness(1.08)', boxShadow: `0 3px 0 ${edge}` },
        '&:active': { transform: 'translateY(3px)', boxShadow: `0 0 0 ${edge}` },
        '&.Mui-disabled': { bgcolor: '#1e1e22', color: '#3c3c44', boxShadow: 'none' },
        transition: 'transform 0.04s ease, box-shadow 0.04s ease, filter 0.12s',
      }}
    >
      {label}
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
