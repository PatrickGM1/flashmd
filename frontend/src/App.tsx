import { useRef, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { Deck, Card, GradedCard, StudyResults } from './types'
import { saveGrades } from './api'
import Home from './components/Home'
import ChapterSelector from './components/ChapterSelector'
import StudySession from './components/StudySession'
import Results from './components/Results'
import DeckEditor from './components/DeckEditor'

type View = 'home' | 'select' | 'study' | 'results' | 'edit'
type Toast = { msg: string; severity: 'success' | 'error' } | null

export default function App() {
  const [view, setView] = useState<View>('home')
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [results, setResults] = useState<StudyResults | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const cardDeck = useRef<Map<Card, string>>(new Map())

  const openDeck = (d: Deck) => {
    setDeck(d)
    setView('select')
  }

  // single-deck session: every card belongs to the open deck
  const startSingle = (c: Card[]) => {
    if (deck) {
      const map = new Map<Card, string>()
      c.forEach(card => map.set(card, deck.id))
      cardDeck.current = map
    }
    setCards(c)
    setView('study')
  }

  // cross-deck "study all due" session
  const startAll = (c: Card[], map: Map<Card, string>) => {
    setDeck(null)
    cardDeck.current = map
    setCards(c)
    setView('study')
  }

  const restudy = (c: Card[]) => {
    setCards(c)
    setView('study')
  }

  const handleDone = async (entries: GradedCard[]) => {
    setResults({
      known: entries.filter(e => e.grade !== 'AGAIN').map(e => e.card),
      unknown: entries.filter(e => e.grade === 'AGAIN').map(e => e.card),
    })
    setView('results')

    // group grades by deck
    const byDeck = new Map<string, { question: string; grade: GradedCard['grade'] }[]>()
    for (const e of entries) {
      const id = cardDeck.current.get(e.card)
      if (!id) continue
      const arr = byDeck.get(id) ?? []
      arr.push({ question: e.card.question, grade: e.grade })
      byDeck.set(id, arr)
    }

    try {
      const saved = await Promise.all([...byDeck].map(([id, grades]) => saveGrades(id, grades)))
      if (deck) {
        const updated = saved.find(d => d.id === deck.id)
        if (updated) setDeck(updated)
      }
      setToast({ msg: 'Progress saved', severity: 'success' })
    } catch {
      setToast({ msg: 'Could not save progress', severity: 'error' })
    }
  }

  return (
    <>
      {view === 'home' && <Home onOpenDeck={openDeck} onStudyAll={startAll} />}
      {view === 'select' && deck && <ChapterSelector deck={deck} onStart={startSingle} onBack={() => setView('home')} onEdit={() => setView('edit')} onDeckChange={setDeck} />}
      {view === 'edit' && deck && <DeckEditor deck={deck} onSaved={d => { setDeck(d); setView('select') }} onBack={() => setView('select')} />}
      {view === 'study' && <StudySession cards={cards} onDone={handleDone} onBack={() => setView(deck ? 'select' : 'home')} />}
      {view === 'results' && results && <Results results={results} onRestudyUnknown={restudy} onBackToDeck={() => setView(deck ? 'select' : 'home')} onHome={() => setView('home')} />}

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: '10px' }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}
