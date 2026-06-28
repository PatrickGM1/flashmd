import { Box, Typography, Button } from '@mui/material'
import { ReplayOutlined, LibraryBooksOutlined, CheckCircleRounded, CloseRounded } from '@mui/icons-material'
import { StudyResults, Card } from '../types'
import { panel } from '../ui'
import Shell, { Brand } from './Shell'

interface Props {
  results: StudyResults
  onRestudyUnknown: (cards: Card[]) => void
  onBackToDeck: () => void
  onHome: () => void
}

export default function Results({ results, onRestudyUnknown, onBackToDeck, onHome }: Props) {
  const total = results.known.length + results.unknown.length
  const pct = total === 0 ? 0 : Math.round((results.known.length / total) * 100)
  const scoreColor = pct >= 80 ? '#5fcf6a' : pct >= 50 ? '#e8b13a' : '#ef5e4e'
  const label = pct >= 80 ? 'Strong round.' : pct >= 50 ? 'Getting there.' : 'Worth another pass.'

  // ring geometry
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <Shell
      left={<Brand onClick={onHome} />}
      right={
        <Button size="small" onClick={onHome} sx={{ color: 'text.secondary', fontSize: 13, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}>
          Home
        </Button>
      }
    >
      {/* Score ring */}
      <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" mb={4}>
        <Box position="relative" width={128} height={128} mb={2.5}>
          <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="64" cy="64" r={r} fill="none" stroke="#23232a" strokeWidth="10" />
            <circle
              cx="64" cy="64" r={r} fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography sx={{ fontFamily: '"Fredoka", sans-serif', fontWeight: 600, fontSize: 30, color: scoreColor, lineHeight: 1 }}>{pct}%</Typography>
          </Box>
        </Box>
        <Typography variant="h6" color="text.primary">{label}</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {results.known.length} knew, {results.unknown.length} missed
        </Typography>
      </Box>

      {/* Actions */}
      <Box display="flex" flexDirection="column" gap={1.25} mb={results.unknown.length ? 4 : 0}>
        {results.unknown.length > 0 && (
          <Button variant="contained" startIcon={<ReplayOutlined />} onClick={() => onRestudyUnknown(results.unknown)} sx={{ py: 1.3, fontWeight: 600 }}>
            Review {results.unknown.length} missed
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<LibraryBooksOutlined />}
          onClick={onBackToDeck}
          sx={{ py: 1.3, fontWeight: 600, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          Back to deck
        </Button>
      </Box>

      {/* Missed list */}
      {results.unknown.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <CheckCircleRounded sx={{ color: '#5fcf6a', fontSize: 30, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Nothing missed.</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em', fontWeight: 600 }}>
            Missed cards
          </Typography>
          <Box sx={{ ...panel, mt: 1.5, overflow: 'hidden' }}>
            {results.unknown.map((card, i) => (
              <Box
                key={i}
                display="flex" alignItems="flex-start" gap={1.5} px={2} py={1.5}
                sx={{ borderTop: i === 0 ? 'none' : '1.5px solid', borderColor: 'divider' }}
              >
                <CloseRounded sx={{ color: '#ef5e4e', fontSize: 16, mt: '2px', flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight={500} color="text.primary">{card.question}</Typography>
                  <Typography variant="caption" color="#6b6b73">{card.chapterTitle}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Shell>
  )
}
