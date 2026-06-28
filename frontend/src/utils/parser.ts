import { Card, Chapter } from '../types'

export function parseDeck(content: string): Chapter[] {
  const lines = content.split('\n')
  const chapters: Chapter[] = []
  let currentChapter: Chapter | null = null
  let currentQuestion: string | null = null
  let answerLines: string[] = []

  const flushCard = () => {
    if (currentQuestion !== null && currentChapter !== null) {
      const answer = answerLines.join('\n').trim()
      if (answer) {
        currentChapter.cards.push({
          question: currentQuestion,
          answer,
          chapterTitle: currentChapter.title,
        })
      }
    }
    currentQuestion = null
    answerLines = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.startsWith('# ') && !line.startsWith('## ')) {
      flushCard()
      currentChapter = { title: line.slice(2).trim(), cards: [] }
      chapters.push(currentChapter)
    } else if (line.startsWith('## ')) {
      flushCard()
      if (!currentChapter) {
        currentChapter = { title: 'Uncategorized', cards: [] }
        chapters.push(currentChapter)
      }
      currentQuestion = line.slice(3).trim()
    } else if (currentQuestion !== null) {
      answerLines.push(line)
    }
  }

  flushCard()
  return chapters.filter(ch => ch.cards.length > 0)
}

export function shuffleCards(cards: Card[]): Card[] {
  const arr = [...cards]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
