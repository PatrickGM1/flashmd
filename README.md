<p align="center">
  <img src="frontend/public/logo.svg" width="76" alt="flashmd logo" />
</p>

<h1 align="center">flashmd</h1>

<p align="center">
  Flashcards from a plain markdown file. Upload a
  <code>.md</code>, study, and the app remembers which cards you got wrong so
  you can drill them later.
</p>

## Features

- Upload any `.md` deck (drag and drop or click)
- Study by chapter, or pick a random subset of N cards
- **Spaced repetition** (Leitner boxes) with Anki-style grading
  (Again / Hard / Good / Easy): cards you miss come back sooner, cards you know
  recede. "Due for review" and "Study all due" replay the weakest cards first
- **Undo** a mis-grade mid-session; live correct / missed tally
- **Daily streak** tracked across sessions
- **Light and dark theme**: follows your system, toggle in the top-right,
  remembered per browser
- **Accounts**: everyone has their own decks and streak. Sign-up is open by
  default; an admin sees every account, can open anyone's decks, reset
  passwords, promote admins, delete accounts. No email server needed
- **Markdown answers**: bold, lists, code blocks and links render on the back
- **Edit decks in-app**, rename them, reset progress, export back to `.md`
- Per-chapter and per-deck stats (studied / correct)
- Decks and progress are stored by the backend and survive restarts

### Keyboard shortcuts (during study)

| Key             | Action                           |
| --------------- | -------------------------------- |
| `Space`/`Enter` | Flip card                        |
| `1` `2` `3` `4` | Grade Again / Hard / Good / Easy |
| `U`/`Backspace` | Undo last grade                  |
| `Esc`           | Quit session                     |

## Quick start (Docker)

Needs Docker with the Compose plugin. From the repo root:

```bash
docker compose up --build
```

Then open http://localhost:3000 and sign in as `admin` / `admin`. You are
asked to pick a real password right away.

### Accounts and passwords

- First run creates one admin from `FLASHMD_ADMIN_USER` / `FLASHMD_ADMIN_PASSWORD`
  (defaults `admin` / `admin`, forced change on first sign-in). Set them in a
  `.env` next to `docker-compose.yml` or in your shell before `docker compose up`.
- Anyone can create an account from the sign-in page. Set
  `FLASHMD_REGISTRATION=false` to close that; then only admins exist until
  you open it again.
- There is no "forgot password" email. An admin opens the account menu →
  **Accounts**, hits the key icon next to the user, and hands over the
  temporary password shown once. The user must pick a new one on next sign-in.
- "Keep me signed in" keeps the session 30 days; otherwise 12 hours of
  inactivity. Sessions survive restarts (stored under `backend/data/sessions`).
- Decks and activity that existed before accounts were added belong to the
  first admin.

That builds and runs both containers. The frontend (nginx) serves the app and
proxies `/api` to the backend, so port 3000 is the only one you touch.

Decks, progress, accounts and sessions are written to `backend/data/` on the
host (bind mounted into the backend): `decks.json`, `activity.json`,
`users.json` (bcrypt hashes, no plain passwords), `sessions/`. They survive
`docker compose down` and `up` — to wipe everything, delete the folder. Back it
up by copying it.

Stop with `Ctrl+C`, or run detached with `docker compose up --build -d` and
stop later with `docker compose down`.

## Deck format

```markdown
# Chapter Title

## Question

Answer. Can span multiple lines.

## Another question

Another answer.

# Another Chapter

## Question

Answer.
```

| Element  | Syntax           | Meaning                            |
| -------- | ---------------- | ---------------------------------- |
| Chapter  | `# Title`        | Groups cards, selectable in the UI |
| Question | `## Text`        | The whole line is the question     |
| Answer   | Lines below `##` | Runs until the next `##` or `#`    |

Notes:

- Chapters are optional. Cards before any `#` go to "Uncategorized".
- Answers can be multi-line.
- Cards with an empty answer are skipped.

See [`example.md`](example.md) for a full deck.

## Stack

- Frontend: React + Vite + TypeScript + MUI, served by nginx in Docker.
  Fonts are self-hosted, no CDN calls at runtime.
- Backend: Spring Boot (Java 21)

The backend parses uploaded markdown into cards, stores decks and study
progress, and serves them back. Storage is a plain JSON file, no database. The
frontend needs the backend running to load, save, or list decks.

### REST API

Everything under `/api` except `/api/auth/*` needs a session cookie
(`POST /api/auth/login`). Decks are scoped to the signed-in user; admins may add
`?owner=<userId>` to list someone else's.

| Method | Path                            | Purpose                                   |
| ------ | ------------------------------- | ----------------------------------------- |
| POST   | `/api/auth/register`            | Create an account and sign in             |
| POST   | `/api/auth/login`               | Sign in (`remember: true` for 30 days)    |
| POST   | `/api/auth/logout`              | Sign out                                  |
| GET    | `/api/auth/me`                  | Current user, or 401                      |
| PUT    | `/api/auth/password`            | Change own password                       |
| GET    | `/api/admin/users`              | All accounts (admin)                      |
| POST   | `/api/admin/users/{id}/reset-password` | Temporary password, shown once (admin) |
| PUT    | `/api/admin/users/{id}/role`    | `USER` or `ADMIN` (admin)                 |
| DELETE | `/api/admin/users/{id}`         | Delete account and its decks (admin)      |

| Method | Path                       | Purpose                            |
| ------ | -------------------------- | ---------------------------------- |
| GET    | `/api/decks`               | List decks with progress summary   |
| GET    | `/api/decks/{id}`          | Full deck with cards + progress    |
| POST   | `/api/decks`               | Create a deck from raw markdown    |
| PUT    | `/api/decks/{id}`          | Replace deck content (in-app edit) |
| PUT    | `/api/decks/{id}/label`    | Rename a deck                      |
| PUT    | `/api/decks/{id}/progress` | Record session grades, reschedule  |
| DELETE | `/api/decks/{id}/progress` | Reset a deck's progress            |
| DELETE | `/api/decks/{id}`          | Delete a deck                      |
| GET    | `/api/activity`            | Study streak and today's count     |

Swagger UI is at `/swagger-ui/index.html` on the backend.

## Tests

```bash
cd backend  && mvn test    # JUnit: parser, scheduler, decks, auth
cd frontend && npm test    # Vitest: parser, stats / spaced repetition
```


## Local development (without Docker)

Run the two services in separate terminals.

Backend (http://localhost:8080):

```bash
cd backend
mvn spring-boot:run
```

Frontend (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev
```

In dev, Vite proxies `/api` to `localhost:8080`, so start the backend first.
Data is written under `backend/data/`. Override paths with `FLASHMD_DATA_FILE`,
`FLASHMD_ACTIVITY_FILE`, `FLASHMD_USERS_FILE`, `FLASHMD_SESSION_DIR`.

## Layout

```
flashmd/
  backend/    Spring Boot API (parsing, storage)
  frontend/   React + Vite app
  docker-compose.yml
  example.md  sample deck
  PRODUCT.md  what the product is and must stay
  DESIGN.md   the visual system (tokens, components, rules)
```
