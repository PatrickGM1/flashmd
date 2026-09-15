import { Account, Activity, Deck, DeckSummary, Grade, Me } from './types'

const BASE = '/api/decks'

/** Fired when the server says the session is gone; App drops to the login table. */
export const UNAUTHORIZED = 'flashmd:unauthorized'

async function json<T>(res: Response): Promise<T> {
  if (res.status === 401 && !res.url.includes('/api/auth/')) {
    window.dispatchEvent(new Event(UNAUTHORIZED))
  }
  if (!res.ok) {
    // Spring error bodies are JSON; surface their message, not the blob
    const text = await res.text().catch(() => '')
    let msg = text
    try { msg = JSON.parse(text).message || msg } catch { /* plain text */ }
    throw new Error(msg || `Request failed (${res.status})`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

const post = (url: string, body?: unknown, method = 'POST') =>
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })

// ---------- decks ----------

/** owner: admin-only, list another user's decks. */
export function listDecks(owner?: string): Promise<DeckSummary[]> {
  return fetch(owner ? `${BASE}?owner=${encodeURIComponent(owner)}` : BASE).then(json<DeckSummary[]>)
}

export function getDeck(id: string): Promise<Deck> {
  return fetch(`${BASE}/${id}`).then(json<Deck>)
}

export function createDeck(label: string, content: string, owner?: string): Promise<Deck> {
  return post(BASE, { label, content, owner }).then(json<Deck>)
}

export function updateDeck(id: string, label: string, content: string): Promise<Deck> {
  return post(`${BASE}/${id}`, { label, content }, 'PUT').then(json<Deck>)
}

export function saveGrades(id: string, grades: { question: string; grade: Grade }[]): Promise<Deck> {
  return post(`${BASE}/${id}/progress`, { grades }, 'PUT').then(json<Deck>)
}

export function resetProgress(id: string): Promise<Deck> {
  return fetch(`${BASE}/${id}/progress`, { method: 'DELETE' }).then(json<Deck>)
}

export function renameDeck(id: string, label: string): Promise<Deck> {
  return post(`${BASE}/${id}/label`, { label }, 'PUT').then(json<Deck>)
}

export function deleteDeck(id: string): Promise<void> {
  return fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(json<void>)
}

export function getActivity(owner?: string): Promise<Activity> {
  return fetch(owner ? `/api/activity?owner=${encodeURIComponent(owner)}` : '/api/activity').then(json<Activity>)
}

// ---------- auth ----------

export function me(): Promise<Me | null> {
  return fetch('/api/auth/me').then(res => (res.status === 401 ? null : json<Me>(res)))
}

export function login(username: string, password: string, remember: boolean): Promise<Me> {
  return post('/api/auth/login', { username, password, remember }).then(json<Me>)
}

export function register(username: string, password: string, remember: boolean): Promise<Me> {
  return post('/api/auth/register', { username, password, remember }).then(json<Me>)
}

export function logout(): Promise<void> {
  return post('/api/auth/logout').then(json<void>)
}

export function changePassword(current: string, next: string): Promise<Me> {
  return post('/api/auth/password', { current, next }, 'PUT').then(json<Me>)
}

// ---------- admin ----------

export function listAccounts(): Promise<Account[]> {
  return fetch('/api/admin/users').then(json<Account[]>)
}

export function resetAccountPassword(id: string): Promise<{ password: string }> {
  return post(`/api/admin/users/${id}/reset-password`).then(json<{ password: string }>)
}

export function setAccountRole(id: string, role: 'USER' | 'ADMIN'): Promise<Account> {
  return post(`/api/admin/users/${id}/role`, { role }, 'PUT').then(json<Account>)
}

export function deleteAccount(id: string): Promise<void> {
  return fetch(`/api/admin/users/${id}`, { method: 'DELETE' }).then(json<void>)
}
