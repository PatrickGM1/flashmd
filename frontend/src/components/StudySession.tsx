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
          height: 2, bgcolor: 'transparent',
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
            <Face sx={{ bgcolor: '#141416', border: '1px solid #26262b' }}>
              <Typography variant="h5" fontWeight={600} textAlign="center" color="text.primary" lineHeight={1.45} sx={{ letterSpacing: '-0.01em' }}>
                {card.question}
              </Typography>
              <Hint>tap to flip</Hint>
            </Face>
            {/* Back */}
            <Face
              back
              sx={{
                bgcolor: '#13111d',
                border: '1px solid #332c52',
                boxShadow: '0 0 40px rgba(124,106,247,0.06)',
              }}
            >
              <Typography variant="body1" textAlign="center" color="text.primary" lineHeight={1.75} sx={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>
                {card.answer}
              </Typography>
            </Face>
          </Box>
        </Box>

        {/* Actions */}
        <Box display="flex" gap={1.5} width="100%" maxWidth={420}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CloseRounded />}
            onClick={() => advance(false)}
            disabled={!flipped}
            sx={{
              py: 1.4, fontWeight: 600,
              borderColor: '#26262b', color: '#6a6a72',
              '&:not(:disabled):hover': { borderColor: '#ef5350', color: '#ef5350', bgcolor: 'rgba(239,83,80,0.06)' },
              '&.Mui-disabled': { borderColor: '#1c1c20', color: '#333' },
            }}
          >
            Missed
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CheckRounded />}
            onClick={() => advance(true)}
            disabled={!flipped}
            sx={{
              py: 1.4, fontWeight: 600,
              borderColor: '#26262b', color: '#6a6a72',
              '&:not(:disabled):hover': { borderColor: '#66bb6a', color: '#66bb6a', bgcolor: 'rgba(102,187,106,0.06)' },
              '&.Mui-disabled': { borderColor: '#1c1c20', color: '#333' },
            }}
          >
            Knew it
          </Button>
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
        borderRadius: 3,
        p: { xs: 3.5, sm: 5 },
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="caption" sx={{ position: 'absolute', bottom: 16, color: '#3a3a40', letterSpacing: '0.05em' }}>
      {children}
    </Typography>
  )
}
