import { useState } from 'react'
import { Deck, Card, StudyResults } from './types'
import { saveProgress } from './api'
import Home from './components/Home'
import ChapterSelector from './components/ChapterSelector'
import StudySession from './components/StudySession'
import Results from './components/Results'

type View = 'home' | 'select' | 'study' | 'results'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [results, setResults] = useState<StudyResults | null>(null)

  const openDeck = (d: Deck) => {
    setDeck(d)
    setView('select')
  }

  const handleStart = (c: Card[]) => {
    setCards(c)
    setView('study')
  }

  const handleDone = (r: StudyResults) => {
    setResults(r)
    setView('results')
    if (deck) {
      saveProgress(deck.id, r)
        .then(updated => setDeck(updated))
        .catch(() => {})
    }
  }

  if (view === 'home') return <Home onOpenDeck={openDeck} />
  if (view === 'select' && deck) return <ChapterSelector deck={deck} onStart={handleStart} onBack={() => setView('home')} />
  if (view === 'study') return <StudySession cards={cards} onDone={handleDone} onBack={() => setView('select')} />
  if (view === 'results' && results) return <Results results={results} onRestudyUnknown={handleStart} onBackToDeck={() => setView('select')} onHome={() => setView('home')} />

  return null
}
