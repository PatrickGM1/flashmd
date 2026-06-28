export interface Card {
  question: string
  answer: string
  chapterTitle: string
}

export interface Chapter {
  title: string
  cards: Card[]
}

export interface StudyResults {
  known: Card[]
  unknown: Card[]
}
