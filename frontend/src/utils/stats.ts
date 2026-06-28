import { Card, Progress } from '../types'

export interface Stat {
  total: number
  done: number     // studied at least once
  correct: number  // last review was correct
}

// must mirror backend Scheduler.INTERVAL_DAYS
const INTERVAL_DAYS = [0, 1, 3, 7, 16, 30]
const MAX_BOX = INTERVAL_DAYS.length - 1

const clampBox = (b: number) => Math.max(0, Math.min(b, MAX_BOX))

function daysBetween(fromISO: string, to: Date): number {
  const from = new Date(fromISO + 'T00:00:00')
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000)
}

export interface DeckProgress {
  known: Set<string>
  wrong: Set<string>
  due: Set<string>
}

/** Derive known/wrong/due question sets from a deck's progress. */
export function readProgress(progress: Progress | null, today = new Date()): DeckProgress {
  const known = new Set<string>()
  const wrong = new Set<string>()
  const due = new Set<string>()
  const cards = progress?.cards ?? {}
  for (const [q, s] of Object.entries(cards)) {
    if (s.known) known.add(q); else wrong.add(q)
    if (daysBetween(s.lastSeen, today) >= INTERVAL_DAYS[clampBox(s.box)]) due.add(q)
  }
  return { known, wrong, due }
}

export function statsFor(cards: Card[], known: Set<string>, wrong: Set<string>): Stat {
  let done = 0
  let correct = 0
  for (const c of cards) {
    if (known.has(c.question)) { done++; correct++ }
    else if (wrong.has(c.question)) { done++ }
  }
  return { total: cards.length, done, correct }
}

export function accuracyColor(stat: Stat): string {
  if (stat.done === 0) return '#3a3a42'
  const pct = stat.correct / stat.done
  return pct >= 0.8 ? '#5fcf6a' : pct >= 0.5 ? '#e8b13a' : '#ef5e4e'
}

/** Order cards weakest-first for a spaced-repetition session. */
export function orderForReview(cards: Card[], progress: Progress | null): Card[] {
  const map = progress?.cards ?? {}
  const boxOf = (c: Card) => (map[c.question] ? clampBox(map[c.question].box) : 0)
  return [...cards].sort((a, b) => boxOf(a) - boxOf(b) || Math.random() - 0.5)
}
