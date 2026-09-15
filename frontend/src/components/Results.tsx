import { Box, Typography, Button, useTheme } from '@mui/material'
import { ReplayOutlined, ArrowBackOutlined } from '@mui/icons-material'
import { StudyResults, Card } from '../types'
import { ink, table, stock } from '../ui'
import { fonts } from '../theme'
import Shell, { Brand } from './Shell'
import { CardBack } from './cards'

interface Props {
  results: StudyResults
  onRestudyUnknown: (cards: Card[]) => void
  onBackToDeck: () => void
  onHome: () => void
}

export default function Results({ results, onRestudyUnknown, onBackToDeck, onHome }: Props) {
  const total = results.known.length + results.unknown.length
  const pct = total === 0 ? 0 : Math.round((results.known.length / total) * 100)
  const scoreColor = pct >= 80 ? ink.good : pct >= 50 ? ink.hard : ink.again
  const label = pct >= 80 ? 'Strong round.' : pct >= 50 ? 'Getting there.' : 'Worth another pass.'
  const seed = results.known[0]?.chapterTitle ?? results.unknown[0]?.chapterTitle ?? 'deck'

  return (
    <Shell
      left={<Brand onClick={onHome} />}
      right={<Button size="small" onClick={onHome} sx={{ fontSize: 13 }}>All decks</Button>}
    >
      <Typography variant="h4" sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1, mb: 3 }}>{label}</Typography>

      {/* Two piles on the table and the score pad beside them */}
      <Box display="flex" gap={{ xs: 2, sm: 3 }} alignItems="stretch" flexWrap="wrap" mb={3}>
        <Box display="flex" gap={{ xs: 2, sm: 3 }} flex="1 1 220px">
          <Pile seed={seed} count={results.known.length} label="Knew" color={ink.good} />
          <Pile seed={seed} count={results.unknown.length} label="Missed" color={ink.again} />
        </Box>
        <Pad flex="1 1 220px" rows={[
          ['Dealt', String(total), ink.card],
          ['Knew', String(results.known.length), ink.good],
          ['Missed', String(results.unknown.length), ink.again],
        ]} total={['Score', `${pct}%`, scoreColor]} />
      </Box>

      <Box display="flex" flexDirection="column" gap={1.25} mb={results.unknown.length ? 4 : 0}>
        {results.unknown.length > 0 && (
          <Button variant="contained" startIcon={<ReplayOutlined />} onClick={() => onRestudyUnknown(results.unknown)} sx={{ py: 1.2, fontSize: 15 }}>
            Deal the {results.unknown.length} missed again
          </Button>
        )}
        <Button variant="outlined" startIcon={<ArrowBackOutlined />} onClick={onBackToDeck} sx={{ py: 1.1 }}>
          Back to deck
        </Button>
      </Box>

      {results.unknown.length > 0 && (
        <>
          <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 20, mb: 1.25 }}>Missed pile</Typography>
          <Box sx={{ ...stock, overflow: 'hidden' }}>
            {results.unknown.map((card, i) => (
              <Box
                key={i}
                display="flex" alignItems="flex-start" gap={1.5} px={2} py={1.5}
                sx={{ borderTop: i === 0 ? 'none' : `1.5px solid ${ink.cardRule}` }}
              >
                <Box sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 16, color: ink.red, width: 24, flexShrink: 0, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                  {i + 1}
                </Box>
                <Box minWidth={0}>
                  <Typography sx={{ fontSize: 15, fontWeight: 500, overflowWrap: 'anywhere' }}>{card.question}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: ink.cardMuted }}>{card.chapterTitle}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Shell>
  )
}

/** A face-down pile at card ratio; the count is printed on the top card's ribbon. Empty pile = outline on the table. */
function Pile({ seed, count, label, color }: { seed: string; count: number; label: string; color: string }) {
  const t = table[useTheme().palette.mode]
  const depth = Math.min(4, count)
  return (
    <Box flex="1 1 0" minWidth={0}>
      <Box sx={{ position: 'relative', mr: '12px', mb: '12px' }}>
        {count === 0 ? (
          <Box sx={{ aspectRatio: '63 / 88', borderRadius: '12px', border: `2px dashed ${t.rule}` }} />
        ) : (
          <>
            {Array.from({ length: depth - 1 }).map((_, i) => (
              <CardBack key={i} seed={seed} sx={{ position: 'absolute', inset: 0, transform: `translate(${(depth - 1 - i) * 3}px, ${(depth - 1 - i) * 3}px)` }} />
            ))}
            <CardBack seed={seed} sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', bgcolor: 'background.paper', py: 1, textAlign: 'center', borderTop: `1.5px solid ${ink.cardRule}`, borderBottom: `1.5px solid ${ink.cardRule}` }}>
                <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: { xs: 34, sm: 40 }, lineHeight: 1, color, fontVariantNumeric: 'tabular-nums' }}>
                  {count}
                </Typography>
              </Box>
            </CardBack>
          </>
        )}
      </Box>
      <Typography sx={{ mt: 1, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{label}</Typography>
    </Box>
  )
}

/** Bridge-pad tally: ruled rows, one score line under the rule. */
function Pad({ rows, total, flex }: { rows: [string, string, string][]; total: [string, string, string]; flex: string }) {
  const row = (r: [string, string, string], big?: boolean) => (
    <Box key={r[0]} display="flex" alignItems="baseline" justifyContent="space-between" sx={{ py: big ? 1.25 : 0.9, borderTop: `1px solid ${ink.cardRule}` }}>
      <Typography sx={{ fontSize: big ? 15 : 14, fontWeight: big ? 700 : 500, color: big ? ink.card : ink.cardMuted }}>{r[0]}</Typography>
      <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: big ? 30 : 20, lineHeight: 1, color: r[2], fontVariantNumeric: 'tabular-nums' }}>{r[1]}</Typography>
    </Box>
  )
  return (
    <Box sx={{ ...stock, flex, px: 2.5, pt: 1.5, pb: 1, alignSelf: 'flex-start' }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: ink.cardMuted, mb: 0.5 }}>This round</Typography>
      {rows.map(r => row(r))}
      <Box sx={{ borderTop: `2px solid ${ink.card}` }}>{row(total, true)}</Box>
    </Box>
  )
}
