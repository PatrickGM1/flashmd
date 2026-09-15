// Card-table tokens. Two tables (light / dark), one card stock.

// Inks that never change with the theme: what is printed on the cards and chips.
export const ink = {
  card: '#161616',
  cardMuted: '#5f5f5f',
  cardRule: '#dcd8cf',
  blue: '#0d3b8f',
  blueHover: '#134aad',
  blueEdge: '#082560',
  red: '#c8102e',
  redEdge: '#7f0a1d',
  // one color law: a grade's color is the same everywhere it appears
  again: '#c8102e',
  hard: '#d97b12',
  good: '#1f8a4c',
  easy: '#0d3b8f',
}

export const table = {
  light: {
    ground: '#c9dbc5',
    stock: '#faf8f3',
    text: '#14301f',
    muted: '#3e5a47',
    rule: '#a9bfa5',
    hover: 'rgba(20,48,31,0.06)',
    focus: '#0d3b8f',
    // text on the table in the accent hues
    blueText: '#0d3b8f',
    redText: '#a60c25',
    goodText: '#1f6e3e',
    hardText: '#9a5407',
  },
  dark: {
    ground: '#143627',
    stock: '#faf8f3',
    text: '#e9e5d8',
    muted: '#a8bcae',
    rule: '#2b5540',
    hover: 'rgba(245,242,234,0.08)',
    focus: '#9dc0ff',
    blueText: '#9dc0ff',
    redText: '#ff8a96',
    goodText: '#7fd69b',
    hardText: '#f2a955',
  },
}
export type TableTokens = typeof table.light

export const gradeInk = { AGAIN: ink.again, HARD: ink.hard, GOOD: ink.good, EASY: ink.easy } as const
export const gradeEdge = { AGAIN: '#7f0a1d', HARD: '#8a4c08', GOOD: '#125430', EASY: '#082560' } as const

/** Accuracy color printed on card stock (white), where the plain grade inks read fine. */
export function accuracyColor(correct: number, done: number): string {
  if (done === 0) return ink.cardMuted
  const r = correct / done
  return r >= 0.8 ? ink.good : r >= 0.5 ? ink.hard : ink.again
}

/** Same thresholds, but for text sitting directly on the table. */
export function accuracyOnTable(correct: number, done: number, t: TableTokens): string {
  if (done === 0) return t.muted
  const r = correct / done
  return r >= 0.8 ? t.goodText : r >= 0.5 ? t.hardText : t.redText
}

/** Card stock surface: what every face-up card is made of. */
export const stock = {
  bgcolor: 'background.paper',
  color: ink.card,
  borderRadius: '12px',
  boxShadow: '0 1px 0 rgba(0,0,0,0.12), 0 8px 18px -6px rgba(0,0,0,0.28)',
}

export const CARD_RATIO = '63 / 88'
