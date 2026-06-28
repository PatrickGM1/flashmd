<p align="center">
  <img src="frontend/public/logo.svg" width="76" alt="flashmd logo" />
</p>

<h1 align="center">flashmd</h1>

<p align="center">
  Flashcards from a plain markdown file. No account, no sync. Upload a
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
- **Markdown answers**: bold, lists, code blocks and links render on the back
- **Edit decks in-app**, rename them, reset progress, export back to `.md`
- Per-chapter and per-deck stats (studied / correct)
- Decks and progress are stored by the backend and survive restarts

### Keyboard shortcuts (during study)

| Key             | Action                       |
| --------------- | ---------------------------- |
| `Space`/`Enter` | Flip card                    |
| `1` `2` `3` `4` | Grade Again / Hard / Good / Easy |
| `U`/`Backspace` | Undo last grade              |
| `Esc`           | Quit session                 |

## Quick start (Docker)

Needs Docker with the Compose plugin. From the repo root:

```bash
docker compose up --build
```

Then open http://localhost:3000

That builds and runs both containers. The frontend (nginx) serves the app and
proxies `/api` to the backend, so port 3000 is the only one you touch.

Decks and progress are written to `backend/data/decks.json` on the host (bind
mounted into the backend). They survive `docker compose down` and `up` — to
wipe everything, just delete that file. Back it up by copying it.

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

- Frontend: React + Vite + TypeScript + MUI, served by nginx in Docker
- Backend: Spring Boot (Java 21)

The backend parses uploaded markdown into cards, stores decks and study
progress, and serves them back. Storage is a plain JSON file, no database. The
frontend needs the backend running to load, save, or list decks.

### REST API (`/api/decks`)

| Method | Path                    | Purpose                            |
| ------ | ----------------------- | ---------------------------------- |
| GET    | `/api/decks`            | List decks with progress summary   |
| GET    | `/api/decks/{id}`       | Full deck with cards + progress    |
| POST   | `/api/decks`            | Create a deck from raw markdown    |
| PUT    | `/api/decks/{id}`       | Replace deck content (in-app edit) |
| PUT    | `/api/decks/{id}/label` | Rename a deck                      |
| PUT    | `/api/decks/{id}/progress` | Record session grades, reschedule |
| DELETE | `/api/decks/{id}/progress` | Reset a deck's progress         |
| DELETE | `/api/decks/{id}`       | Delete a deck                      |
| GET    | `/api/activity`         | Study streak and today's count     |

Swagger UI is at `/swagger-ui/index.html` on the backend.

## Tests

```bash
cd backend  && mvn test    # JUnit: parser, scheduler, controller
cd frontend && npm test    # Vitest: parser, stats / spaced repetition
```

CI runs both on every push and pull request (`.github/workflows/ci.yml`).

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
Decks are written to `backend/data/decks.json`. Override the path with the
`FLASHMD_DATA_FILE` environment variable.

## Layout

```
flashmd/
  backend/    Spring Boot API (parsing, storage)
  frontend/   React + Vite app
  docker-compose.yml
  example.md  sample deck
```
