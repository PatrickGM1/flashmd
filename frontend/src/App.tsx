import { useEffect, useMemo, useRef, useState } from 'react'
import { Snackbar, Alert, Box, CircularProgress } from '@mui/material'
import { Deck, Card, GradedCard, StudyResults, Me, Account } from './types'
import { saveGrades, me as fetchMe, logout, UNAUTHORIZED } from './api'
import { AuthCtx, AuthNav } from './auth'
import Home from './components/Home'
import ChapterSelector from './components/ChapterSelector'
import StudySession from './components/StudySession'
import Results from './components/Results'
import DeckEditor from './components/DeckEditor'
import Login from './components/Login'
import PasswordChange from './components/PasswordChange'
import Admin from './components/Admin'

type View = 'home' | 'select' | 'study' | 'results' | 'edit' | 'password' | 'admin'
type Toast = { msg: string; severity: 'success' | 'error' } | null

export default function App() {
  const [view, setView] = useState<View>('home')
  const [me, setMe] = useState<Me | null | undefined>(undefined) // undefined = still asking
  const [viewing, setViewing] = useState<Account | null>(null) // admin looking at another player's table
  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [results, setResults] = useState<StudyResults | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const cardDeck = useRef<Map<Card, string>>(new Map())

  useEffect(() => {
    fetchMe().then(setMe).catch(() => setMe(null))
    const drop = () => { setMe(null); setView('home'); setViewing(null) }
    window.addEventListener(UNAUTHORIZED, drop)
    return () => window.removeEventListener(UNAUTHORIZED, drop)
  }, [])

  const signOut = async () => {
    try { await logout() } catch { /* session is gone either way */ }
    setMe(null)
    setView('home')
    setViewing(null)
    setDeck(null)
  }

  const navigate = (to: AuthNav) => {
    if (to === 'home') setViewing(null)
    setView(to)
  }

  const auth = useMemo(() => ({ me: me ?? null, signOut, navigate }), [me])

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

  if (me === undefined) {
    return <Box minHeight="100dvh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default"><CircularProgress size={26} /></Box>
  }
  if (me === null) {
    return <Login onSignedIn={m => { setMe(m); setView('home') }} />
  }
  if (me.mustChangePassword || view === 'password') {
    return <PasswordChange me={me} onChanged={m => { setMe(m); setView('home'); setToast({ msg: 'Password changed', severity: 'success' }) }} onBack={() => setView('home')} />
  }

  return (
    <AuthCtx.Provider value={auth}>
      {view === 'admin' && me.role === 'ADMIN' && (
        <Admin onBack={() => { setViewing(null); setView('home') }} onViewDecks={a => { setViewing(a); setView('home') }} />
      )}
      {view === 'home' && (
        <Home
          key={viewing?.id ?? 'me'}
          onOpenDeck={openDeck}
          onStudyAll={startAll}
          viewing={viewing && viewing.id !== me.id ? viewing : undefined}
          onLeaveViewing={() => { setViewing(null); setView('admin') }}
        />
      )}
      {view === 'select' && deck && <ChapterSelector deck={deck} onStart={startSingle} onBack={() => setView('home')} onEdit={() => setView('edit')} onDeckChange={setDeck} />}
      {view === 'edit' && deck && <DeckEditor deck={deck} onSaved={d => { setDeck(d); setView('select') }} onBack={() => setView('select')} />}
      {view === 'study' && <StudySession cards={cards} onDone={handleDone} onBack={() => setView(deck ? 'select' : 'home')} />}
      {view === 'results' && results && <Results results={results} onRestudyUnknown={restudy} onBackToDeck={() => setView(deck ? 'select' : 'home')} onHome={() => setView('home')} />}

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </AuthCtx.Provider>
  )
}
