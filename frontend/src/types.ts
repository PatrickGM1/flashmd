export interface Card {
  question: string
  answer: string
  chapterTitle: string
}

export interface Chapter {
  title: string
  cards: Card[]
}

export interface CardState {
  box: number
  known: boolean
  lastSeen: string
}

export interface Progress {
  cards: Record<string, CardState>
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
  due: number
  lastStudied: string | null
}

export type Grade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

export interface GradedCard {
  card: Card
  grade: Grade
}

export interface StudyResults {
  known: Card[]
  unknown: Card[]
}

export interface Activity {
  streak: number
  today: number
}
