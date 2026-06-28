export interface Card {
  question: string
  answer: string
  chapterTitle: string
}

export interface Chapter {
  title: string
  cards: Card[]
}

export interface Progress {
  known: string[]
  unknown: string[]
  lastStudied: string | null
}

export interface Deck {
  id: string
  label: string
  chapters: Chapter[]
  progress: Progress | null
}

export interface DeckSummary {
  id: string
  label: string
  totalCards: number
  known: number
  unknown: number
  lastStudied: string | null
}

export interface StudyResults {
  known: Card[]
  unknown: Card[]
}
