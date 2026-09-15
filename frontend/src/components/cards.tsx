import { Box, SxProps, Theme } from '@mui/material'
import { ReactNode, useId } from 'react'
import { fonts } from '../theme'
import { ink, stock, CARD_RATIO } from '../ui'

// ---------- procedural card back ----------

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

/**
 * A face-down card. The back pattern is derived from the seed (deck name),
 * so every deck has its own back and keeps it across sessions.
 */
export function CardBack({ seed, children, sx, mini }: { seed: string; children?: ReactNode; sx?: SxProps<Theme>; mini?: boolean }) {
  const h = hash(seed)
  const color = h & 1 ? ink.red : ink.blue
  const kind = (h >>> 1) % 4            // lattice, diamonds, dots, plaid
  const scale = 8 + ((h >>> 3) % 4) * 2   // tile size 8..14
  const angle = [0, 45, 90, 30][(h >>> 6) % 4]
  const id = useId()

  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: CARD_RATIO,
        width: '100%',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        boxShadow: stock.boxShadow,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box component="svg" aria-hidden sx={{ position: 'absolute', inset: '6%', width: '88%', height: '88%', display: 'block' }} viewBox="0 0 63 88" preserveAspectRatio="none">
        <defs>
          <pattern id={id} width={scale} height={scale} patternUnits="userSpaceOnUse" patternTransform={`scale(${mini ? 1 / 1.4 : 1 / 3.2}) rotate(${angle})`}>
            {kind === 0 && (
              <>
                <path d={`M0 ${scale / 2} L${scale / 2} 0 L${scale} ${scale / 2} L${scale / 2} ${scale} Z`} fill="none" stroke={color} strokeWidth="1.4" />
                <circle cx={scale / 2} cy={scale / 2} r="1.1" fill={color} />
              </>
            )}
            {kind === 1 && (
              <>
                <path d={`M${scale / 2} 1 L${scale - 1} ${scale / 2} L${scale / 2} ${scale - 1} L1 ${scale / 2} Z`} fill={color} />
              </>
            )}
            {kind === 3 && (
              <>
                <rect x="0" y="0" width={scale / 2} height={scale / 2} fill={color} />
                <rect x={scale / 2} y={scale / 2} width={scale / 2} height={scale / 2} fill={color} opacity="0.55" />
              </>
            )}
            {kind === 2 && (
              <>
                <circle cx={scale / 4} cy={scale / 4} r="1.3" fill={color} />
                <circle cx={(scale * 3) / 4} cy={(scale * 3) / 4} r="1.3" fill={color} />
                <path d={`M0 0 L${scale} ${scale}`} stroke={color} strokeWidth="0.7" />
              </>
            )}
          </pattern>
        </defs>
        <rect x="0" y="0" width="63" height="88" rx="2.5" fill={color} />
        <rect x="1.6" y="1.6" width="59.8" height="84.8" rx="1.6" fill="#ffffff" />
        <rect x="3" y="3" width="57" height="82" rx="1" fill={`url(#${id})`} />
        <rect x="3" y="3" width="57" height="82" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
      </Box>
      {children}
    </Box>
  )
}

// ---------- corner index ----------

/** Corner index like a rank on a playing card: top-left upright, bottom-right rotated. */
export function Index({ children, corner = 'tl', color = ink.card, size = 22 }: {
  children: ReactNode; corner?: 'tl' | 'br'; color?: string; size?: number
}) {
  return (
    <Box
      aria-hidden={corner === 'br'}
      sx={{
        position: 'absolute',
        ...(corner === 'tl' ? { top: 12, left: 14 } : { bottom: 12, right: 14, transform: 'rotate(180deg)' }),
        fontFamily: fonts.index, fontWeight: 700, fontSize: size, lineHeight: 1,
        color, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
        userSelect: 'none',
      }}
    >
      {children}
    </Box>
  )
}

// ---------- poker chip ----------

export function Chip({ color, edge, size = 64, label, children, onClick, disabled, title, sx, tabIndex }: {
  color: string; edge: string; size?: number; label?: string; children?: ReactNode
  onClick?: (e: React.MouseEvent<HTMLElement>) => void; disabled?: boolean; title?: string; sx?: SxProps<Theme>; tabIndex?: number
}) {
  const clickable = !!onClick
  return (
    <Box
      component={clickable ? 'button' : 'div'}
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title}
      tabIndex={tabIndex}
      sx={{
        position: 'relative',
        width: size, height: size, flexShrink: 0,
        borderRadius: '50%',
        border: 'none', p: 0, m: 0,
        bgcolor: color,
        color: '#fff',
        fontFamily: fonts.index, fontWeight: 700, fontSize: size * 0.42, lineHeight: 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: clickable && !disabled ? 'pointer' : 'default',
        boxShadow: `0 3px 0 ${edge}, 0 6px 10px -4px rgba(0,0,0,0.35)`,
        transition: 'transform 0.06s ease, box-shadow 0.06s ease, filter 0.12s',
        ...(clickable && {
          '&:hover:not(:disabled)': { filter: 'brightness(1.08)' },
          '&:active:not(:disabled)': { transform: 'translateY(3px)', boxShadow: `0 0 0 ${edge}, 0 2px 4px -2px rgba(0,0,0,0.35)` },
        }),
        ...sx,
      }}
    >
      <Box component="svg" aria-hidden viewBox="0 0 100 100" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="7" strokeDasharray="17.3 17.3" strokeDashoffset="8.6" />
        <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      </Box>
      <Box component="span" sx={{ position: 'relative' }}>{children}</Box>
    </Box>
  )
}

// ---------- a face-up card surface ----------

export function Face({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box sx={{ ...stock, position: 'relative', ...sx }}>
      {children}
    </Box>
  )
}
