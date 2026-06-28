import { describe, it, expect } from 'vitest'
import { readProgress, statsFor, orderForReview } from './stats'
import { Card, Progress } from '../types'

const card = (question: string): Card => ({ question, answer: 'a', chapterTitle: 'C' })
const today = new Date('2025-06-10T12:00:00')

const progress: Progress = {
  lastStudied: '2025-06-10',
  cards: {
    q1: { box: 1, known: true, lastSeen: '2025-06-09' },   // interval 1, due
    q2: { box: 0, known: false, lastSeen: '2025-06-10' },  // box 0, always due
    q3: { box: 3, known: true, lastSeen: '2025-06-09' },   // interval 7, not due
  },
}

describe('readProgress', () => {
  it('splits known / wrong / due', () => {
    const { known, wrong, due } = readProgress(progress, today)
    expect([...known].sort()).toEqual(['q1', 'q3'])
    expect([...wrong]).toEqual(['q2'])
    expect(due.has('q1')).toBe(true)
    expect(due.has('q2')).toBe(true)
    expect(due.has('q3')).toBe(false)
  })

  it('handles null progress', () => {
    const { known, due } = readProgress(null)
    expect(known.size).toBe(0)
    expect(due.size).toBe(0)
  })
})

describe('statsFor', () => {
  it('counts done and correct', () => {
    const { known, wrong } = readProgress(progress, today)
    const stat = statsFor([card('q1'), card('q2'), card('q4')], known, wrong)
    expect(stat).toEqual({ total: 3, done: 2, correct: 1 })
  })
})

describe('orderForReview', () => {
  it('orders weakest (lowest box) first', () => {
    const cards = [card('q3'), card('q1'), card('q2')]
    const ordered = orderForReview(cards, progress).map(c => c.question)
    expect(ordered[0]).toBe('q2') // box 0
    expect(ordered[ordered.length - 1]).toBe('q3') // box 3
  })
})
