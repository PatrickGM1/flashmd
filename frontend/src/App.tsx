import { useState } from 'react'
import { Chapter, Card } from './types'
import Home from './components/Home'
import ChapterSelector from './components/ChapterSelector'

type View = 'home' | 'select'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [, setCards] = useState<Card[]>([])

  const handleDeckLoaded = (ch: Chapter[]) => {
    setChapters(ch)
    setView('select')
  }

  const handleStart = (cards: Card[]) => {
    setCards(cards)
    // StudySession next
    console.log('Starting with', cards.length, 'cards')
  }

  if (view === 'home') return <Home onDeckLoaded={handleDeckLoaded} />
  if (view === 'select') return <ChapterSelector chapters={chapters} onStart={handleStart} />

  return null
}
