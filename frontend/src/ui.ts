import { SxProps, Theme } from '@mui/material'

// Static surface: a panel that holds content.
export const panel: SxProps<Theme> = {
  border: '1.5px solid',
  borderColor: 'divider',
  borderRadius: '14px',
  bgcolor: 'background.paper',
}

// Tactile clickable surface: presses down when clicked.
export const tile: SxProps<Theme> = {
  ...panel,
  cursor: 'pointer',
  boxShadow: '0 2px 0 rgba(0,0,0,0.45)',
  transition: 'transform 0.05s ease, border-color 0.15s ease, box-shadow 0.05s ease',
  '&:hover': { borderColor: '#3c3c45' },
  '&:active': { transform: 'translateY(2px)', boxShadow: '0 0 0 rgba(0,0,0,0.45)' },
}

export const colors = {
  good: '#5fcf6a',
  ok: '#e8b13a',
  bad: '#ef5e4e',
  accent: '#7c6af7',
  accentSoft: '#9a8cf9',
  muted: '#8e8e98',
  faint: '#5a5a62',
}

export function accuracyColor(correct: number, done: number): string {
  if (done === 0) return '#3a3a42'
  const r = correct / done
  return r >= 0.8 ? colors.good : r >= 0.5 ? colors.ok : colors.bad
}
