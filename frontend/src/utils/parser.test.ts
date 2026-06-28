import { describe, it, expect } from 'vitest'
import { parseDeck, toMarkdown, shuffleCards } from './parser'

describe('parseDeck', () => {
  it('parses chapters, questions and multi-line answers', () => {
    const md = '# Ch\n## Q1\nA1\n## Q2\nline a\nline b\n'
    const chapters = parseDeck(md)
    expect(chapters).toHaveLength(1)
    expect(chapters[0].cards).toHaveLength(2)
    expect(chapters[0].cards[1].answer).toBe('line a\nline b')
  })

  it('puts orphan cards in Uncategorized', () => {
    expect(parseDeck('## Q\nA\n')[0].title).toBe('Uncategorized')
  })

  it('skips empty answers and empty chapters', () => {
    const chapters = parseDeck('# Empty\n# Real\n## Q\nA\n## NoAns\n')
    expect(chapters).toHaveLength(1)
    expect(chapters[0].cards.map(c => c.question)).toEqual(['Q'])
  })

  it('returns [] for content with no cards', () => {
    expect(parseDeck('just prose')).toEqual([])
  })
})

describe('toMarkdown', () => {
  it('round-trips through parseDeck', () => {
    const md = '# A\n## Q1\nans 1\n## Q2\nans 2\n# B\n## Q3\nans 3\n'
    const again = parseDeck(toMarkdown(parseDeck(md)))
    expect(again).toHaveLength(2)
    expect(again[0].cards[0].question).toBe('Q1')
    expect(again[1].cards[0].answer).toBe('ans 3')
  })
})

describe('shuffleCards', () => {
  it('keeps the same elements', () => {
    const cards = parseDeck('# C\n## a\n1\n## b\n2\n## c\n3\n')[0].cards
    const out = shuffleCards(cards)
    expect(out).toHaveLength(3)
    expect(new Set(out.map(c => c.question))).toEqual(new Set(['a', 'b', 'c']))
  })
})
