import { Deck, DeckSummary, StudyResults } from './types'

const BASE = '/api/decks'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || `Request failed (${res.status})`)
  }
  return res.json()
}

export function listDecks(): Promise<DeckSummary[]> {
  return fetch(BASE).then(json<DeckSummary[]>)
}

export function getDeck(id: string): Promise<Deck> {
  return fetch(`${BASE}/${id}`).then(json<Deck>)
}

export function createDeck(label: string, content: string): Promise<Deck> {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, content }),
  }).then(json<Deck>)
}

export function saveProgress(id: string, results: StudyResults): Promise<Deck> {
  return fetch(`${BASE}/${id}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      known: results.known.map(c => c.question),
      unknown: results.unknown.map(c => c.question),
    }),
  }).then(json<Deck>)
}

export function deleteDeck(id: string): Promise<void> {
  return fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(res => {
    if (!res.ok) throw new Error(`Delete failed (${res.status})`)
  })
}
