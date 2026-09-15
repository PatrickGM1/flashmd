# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and self-learners generally: people who already keep notes in
markdown and want to drill them as flashcards without Anki's setup burden.
Self-hosted (Docker Compose), single user per instance, no accounts. Used in
focused study sittings, mostly on desktop, keyboard-driven during a session.

## Product Purpose

Turn a plain `.md` file into a spaced-repetition flashcard deck. Upload a
deck, study by chapter or random subset, grade each card (Again / Hard /
Good / Easy), and the app schedules weak cards to come back sooner. Success
is a learner who returns daily, clears their due cards fast, and keeps
writing decks in their own editor.

## Positioning

The deck is a plain `.md` file you own. `# Chapter` / `## Question` /
answer body is the whole format. No proprietary card format, no account, no
sync service; write in any editor, keep it in git, export back out losslessly
from the app. Anki, Quizlet, and Obsidian plugins cannot truthfully claim
"your deck is just the markdown file."

## Operating Context

- Deck authoring happens outside the app (any text editor, git) or in the
  in-app editor; the file is the source of truth.
- Study loop: flip (`Space`/`Enter`), grade (`1`–`4`), undo (`U`/`Backspace`),
  quit (`Esc`). Sessions are short and rapid; the keyboard drives them.
- Progress (Leitner boxes, per-card due dates, streak) lives server-side in
  `backend/data/decks.json`; survives restarts.
- Views: Home (deck list, due counts, streak, upload), chapter/subset
  selector, study session, results, deck editor.
- Format reference: `example.md` (also served at `frontend/public/example.md`).

## Capabilities and Constraints

Confirmed functionality (must be preserved by any visual work):

- Upload `.md` (drag-drop or click); parse into chapters + cards.
- Study by chapter, random N-card subset, "Due for review", "Study all due"
  (cross-deck).
- Leitner-box spaced repetition with four Anki-style grades; weakest first.
- Undo mid-session; live correct / missed tally; daily streak.
- Markdown-rendered answers (bold, lists, code, links via react-markdown +
  remark-gfm).
- Edit deck in-app, rename, reset progress, export to `.md`, delete.
- Per-chapter and per-deck stats (studied / correct).

Constraints:

- **Backend and functionality are off-limits.** Visual work may change the
  frontend look freely but must not touch `backend/`, the REST API
  (`/api/decks`, `/api/activity`), the deck format, storage, or any
  behavior above. Decision recorded 2026-09-15.
- Frontend stack: React 18 + Vite + TypeScript + MUI 5 (Emotion). Stack
  itself is not a stated constraint; behavior is.
- Single JSON file storage, no database, no auth, no multi-user.
- Terminology: deck, chapter, card, question/answer, grade (Again / Hard /
  Good / Easy), due, streak, box (Leitner).

## Brand Commitments

- Name: `flashmd` (lowercase).
- Logo: `frontend/public/logo.svg` — fanned card pair with a lightning-bolt suit (replaced the purple bulb mark 2026-09-15 at the user's request; used in README, favicon, OG image).
- Incumbent look (dark theme, `#7c6af7` accent, Fredoka + IBM Plex Sans/Mono)
  is **not** binding; the user wants the visual changed. Treat as evidence and
  anti-reference, not a commitment.

## Evidence on Hand

- Working product: full frontend in `frontend/src/`, backend in `backend/`.
- Sample deck: `example.md`.
- Tests: JUnit (parser, scheduler, controller), Vitest (parser, stats).
- No testimonials, user counts, press, or benchmarks exist. Do not fabricate.

## Product Principles

1. The markdown file is the product; the app is a viewer/driller of it.
2. A study session is a fast keyboard loop; nothing may add friction between
   flip and grade.
3. Progress is honest and visible: due counts, tallies, streak, accuracy.
4. Zero setup beyond `docker compose up`; no accounts, no sync, no config.
5. Visual freedom, functional fidelity: change how it looks, never what it does.
