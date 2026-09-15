---
version: 1
slug: "frontend-src-app-tsx"
primary_target: "frontend/src/App.tsx"
related_targets: ["frontend/src/components/Home.tsx","frontend/src/components/StudySession.tsx","frontend/src/components/ChapterSelector.tsx","frontend/src/components/Results.tsx","frontend/src/components/DeckEditor.tsx","frontend/src/components/Shell.tsx"]
---

# Surface: flashmd app (all views)

Scope: whole-app visual replacement. Mode: Operate on every view (Home, ChapterSelector, StudySession, Results, DeckEditor, Shell). Phone and desktop equal. Light and dark both required (user-pinned).

Audience/job: students and self-learners drilling their own `.md` decks. Task: flip, grade, see honest progress. Untouched: backend, api.ts, types.ts, utils/, handlers, keyboard shortcuts, factual copy. Anti-goals: gamified confetti, casino chrome, suits/pips carrying meaning labels do not, any friction between flip and grade.

Only functional addition: a theme toggle in the Shell (system default, persisted in localStorage).

## Direction contract

THESIS: A deck is a deck. Cards you cut, shuffle, flip and pile, dealt on a table. Refuses the category default: a centered card on a neutral app surface with four colored buttons and a list of decks with progress bars.

OWN-WORLD: Two tables, one card stock. Light: pale daylight baize ground; dark: deep night baize. Card stock is near-white in both themes and is the light source; ink on cards is near-black always. Bicycle blue and red carry deck backs, indices, and primary actions; no gold, no neon, no gradients, glass or glow (WPA raise). One color law (rain-garden raise): Again red, Hard orange, Good green, Easy blue, identical on chips, progress keys, due badges, results piles. Components: poker card (63:88, rounded corners, corner indices top-left and rotated bottom-right), procedural card back patterned from the deck name, poker chip (round, rim dashes) as the grade control and streak counter, bridge-pad tally. Type: Barlow for UI, Barlow Condensed for indices and numerals, system mono for code.

STORY: The visitor sees their decks lying on the table, picks one up, cuts it to chapters, and drills: one card in the center, flip with one gesture, four chips appear, press one, the next card is dealt. At the end the cards sit in two piles and the pad shows the score.

FIRST VIEWPORT: Home. Table fills the viewport. Header row: brand top-left, streak chip stack and theme toggle top-right. Below: "Study all due (n)" as a Bicycle-blue flat button when due > 0. Then a responsive grid of face-down decks at true card ratio (2 columns on phone, 3 to 4 on desktop), each with a white name ribbon across the back, a due-count badge in the top-right corner, and a one-line stat under the card; the last slot is a dashed card outline that is the upload drop zone. Corner readouts one per corner (viewfinder raise); the center belongs to the cards.

Study viewport: progress row of one key per card along the top edge, lit in grade color, scales and never wraps (drum-machine raise); quit top-left, n/N top-right, tally bottom-left, undo bottom-right; the card centered; four chips beneath, thumb-reach on phone, keys 1 to 4 on desktop.

FORM: Playing-card deck on a baize table, candidate 5 of 7 on the grounded list (Leitner box, split-flap board, highlighter textbook, Seyès exercise book, playing-card deck, Swiss timetable grid, markdown source). Seed key f727e062. Code-led (no image generation available).

Signature interaction: the flip is one gesture rotating the entire card about its vertical axis, no partial reveal; the four chips slide in only after the flip (cape raise). Motion grammar: deal (next card drops in from the deck position, 200ms), flip (450ms), chip press (translateY 2px, edge shadow collapses), undo pulls the chip back. All motion respects prefers-reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
