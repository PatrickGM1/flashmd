# flashmd

Flashcards from a plain markdown file. No account, no sync. Upload a `.md`,
study, and the app remembers which cards you got wrong so you can drill them
later.

## Features

- Upload any `.md` deck (drag and drop or click)
- Study by chapter, or pick a random subset of N cards
- Flip cards and mark each as known or missed
- Decks and progress are stored by the backend and survive reloads
- "Review wrong" mode replays only the cards you missed
- Saved decks show up under "Your decks" with a known/total score

## Quick start (Docker)

Needs Docker with the Compose plugin. From the repo root:

```bash
docker compose up --build
```

Then open http://localhost:3000

That builds and runs both containers. The frontend (nginx) serves the app and
proxies `/api` to the backend, so port 3000 is the only one you touch. Decks
are kept in a named volume (`deck-data`), so they persist across restarts.

Stop with `Ctrl+C`, or run detached with `docker compose up --build -d` and
stop later with `docker compose down`. To wipe all saved decks:

```bash
docker compose down -v
```

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

| Method | Path             | Purpose                          |
| ------ | ---------------- | -------------------------------- |
| GET    | `/`              | List decks with progress summary |
| GET    | `/{id}`          | Full deck with cards + progress  |
| POST   | `/`              | Create a deck from raw markdown  |
| PUT    | `/{id}/progress` | Save known/missed questions      |
| DELETE | `/{id}`          | Delete a deck                    |

Swagger UI is at `/swagger-ui/index.html` on the backend.

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
