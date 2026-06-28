import { Card } from '../types'

export interface Stat {
  total: number
  done: number     // studied at least once (in last saved session)
  correct: number  // marked known
}

/** Per-set stats: how many of these cards were done, and how many correct. */
export function statsFor(cards: Card[], known: Set<string>, unknown: Set<string>): Stat {
  let done = 0
  let correct = 0
  for (const c of cards) {
    if (known.has(c.question)) { done++; correct++ }
    else if (unknown.has(c.question)) { done++ }
  }
  return { total: cards.length, done, correct }
}

export function accuracyColor(stat: Stat): string {
  if (stat.done === 0) return '#3a3a40'
  const pct = stat.correct / stat.done
  return pct >= 0.8 ? '#66bb6a' : pct >= 0.5 ? '#ffa726' : '#ef5350'
}
