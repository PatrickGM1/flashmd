---
name: flashmd
description: Spaced-repetition flashcards from plain markdown, dealt on a baize table.
colors:
  bicycle-blue: "#0d3b8f"
  bicycle-blue-hover: "#134aad"
  bicycle-blue-edge: "#082560"
  bicycle-red: "#c8102e"
  bicycle-red-edge: "#7f0a1d"
  grade-again: "#c8102e"
  grade-hard: "#d97b12"
  grade-good: "#1f8a4c"
  grade-easy: "#0d3b8f"
  grade-again-edge: "#7f0a1d"
  grade-hard-edge: "#8a4c08"
  grade-good-edge: "#125430"
  grade-easy-edge: "#082560"
  card-stock: "#faf8f3"
  card-ink: "#161616"
  card-ink-muted: "#5f5f5f"
  card-rule: "#dcd8cf"
  chip-print: "#ffffff"
  day-baize: "#c9dbc5"
  day-text: "#14301f"
  day-muted: "#3e5a47"
  day-rule: "#a9bfa5"
  day-hover: "rgba(20,48,31,0.06)"
  day-focus: "#0d3b8f"
  day-blue-text: "#0d3b8f"
  day-red-text: "#a60c25"
  day-good-text: "#1f6e3e"
  day-hard-text: "#9a5407"
  night-baize: "#143627"
  night-text: "#e9e5d8"
  night-muted: "#a8bcae"
  night-rule: "#2b5540"
  night-hover: "rgba(245,242,234,0.08)"
  night-focus: "#9dc0ff"
  night-blue-text: "#9dc0ff"
  night-red-text: "#ff8a96"
  night-good-text: "#7fd69b"
  night-hard-text: "#f2a955"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 2rem + 1vw, 2.4rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.1
  index:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.01em"
    fontVariation: "tabular-nums"
  question:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "clamp(22px, 22px + 0.5vw, 26px)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  key: "4px"
  mini-card: "6px"
  control: "8px"
  card: "12px"
  chip: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  header: "56px"
components:
  button-primary:
    backgroundColor: "{colors.bicycle-blue}"
    textColor: "{colors.chip-print}"
    rounded: "{rounded.control}"
    padding: "8.8px 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.bicycle-blue-hover}"
  button-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.day-text}"
    rounded: "{rounded.control}"
    padding: "8.8px 16px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.day-muted}"
    rounded: "{rounded.control}"
  input-field:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.control}"
  card-face:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.card}"
    padding: "56px 40px 48px"
  card-back:
    backgroundColor: "{colors.card-stock}"
    rounded: "{rounded.card}"
  chip-grade:
    backgroundColor: "{colors.grade-good}"
    textColor: "{colors.chip-print}"
    rounded: "{rounded.chip}"
    size: "64px"
    typography: "{typography.index}"
  chip-badge:
    backgroundColor: "{colors.grade-again}"
    textColor: "{colors.chip-print}"
    rounded: "{rounded.chip}"
    size: "34px"
  upload-slot:
    backgroundColor: "transparent"
    textColor: "{colors.day-muted}"
    rounded: "{rounded.card}"
---

# Design System: flashmd

## Overview

**Creative North Star: "The Card Table"**

A deck is a deck. flashmd refuses the category default (a centered card on a neutral app surface, four colored buttons, a list of decks with progress bars) and instead puts real playing cards on a real table. There are two tables, a pale daylight baize and a deep night baize, and exactly one card stock: near-white paper that stays near-white in both themes and is the light source of every screen. Ink printed on a card is near-black regardless of theme; the table's own text shifts with the table.

Color is scarce and rule-bound. Bicycle blue and red carry deck backs, corner indices, and primary actions. A single color law governs grading: Again is red, Hard is orange, Good is green, Easy is blue, and a grade wears the same color everywhere it appears (chips, progress keys, due badges, results piles, accuracy readouts). No gold, no neon, no gradients, no glass, no glow. Depth is physical: a card casts a soft drop on the baize, a chip has a thick edge that collapses when pressed.

Density is generous on the table and tight on the card. Readouts live in the four corners of a view; the center belongs to the cards. Motion is dealing-grammar only: a card drops in, a card flips about its vertical axis, chips slide up after the flip, a press pushes a chip into the table.

**Key Characteristics:**
- Two baize tables (day / night), one unchanging card stock
- Card ink is always near-black; table text follows the theme
- Bicycle blue / red for backs, indices, primary actions; the grade law for everything graded
- Poker-card geometry: 63:88 ratio, 12px corners, corner indices top-left and rotated bottom-right
- Poker chips (round, white rim dashes, thick edge) as the only grade control, counter, and badge
- Procedural card backs derived from the deck name
- Barlow for UI, Barlow Condensed for indices and numerals, system mono for code

## Colors

Two table grounds, one card stock, two playing-card inks, and four grade inks; every other color is a table-tinted text derivative.

### Primary
- **Bicycle Blue** (`bicycle-blue`): the primary action ink. Contained buttons, half of all deck backs, the answer-side corner index, focus ring on the day table, caret and focused input border, text selection. Hover lifts to `bicycle-blue-hover`; the pressed edge is `bicycle-blue-edge`.
- **Bicycle Red** (`bicycle-red`): the other deck-back ink, the error alert stroke, the chapter number on the selector, missed-pile numerals. Its edge is `bicycle-red-edge`.

### Secondary
- **Grade inks**: `grade-again` (red, identical to Bicycle Red), `grade-hard` (orange), `grade-good` (green), `grade-easy` (blue, identical to Bicycle Blue). Each has a matching darker `-edge` for the chip's thickness. Painted on chips, progress keys, and any number that is a grade or an accuracy on card stock (`accuracyColor`: >= 80% good, >= 50% hard, else again).
- **Table-tinted text** (`day-*-text` / `night-*-text`): the same four hues re-mixed to read directly on the baize (deck accuracy under a card, the delete hover, the drop-zone highlight). Use these, never the raw grade ink, for text sitting on the table.

### Neutral
- **Card Stock** (`card-stock`): every face-up card, list card, input, tally pad, and alert body. Same value on both tables.
- **Card Ink** (`card-ink`) and **Card Ink Muted** (`card-ink-muted`): text printed on stock. Never change with theme.
- **Card Rule** (`card-rule`): hairline dividers and the ribbon strokes on stock (1.5px).
- **Chip Print** (`chip-print`): the white numeral and rim dashes on chips, and text on contained buttons.
- **Day Baize / Night Baize** (`day-baize` / `night-baize`): the table ground; also the `theme-color` and the pre-paint background in `index.html`.
- **Day/Night Text, Muted, Rule, Hover, Focus**: table-side text, secondary text, dashed outlines and inactive progress keys, the 6-8% hover wash, and the focus ring (blue on day, sky blue on night).

### Named Rules
**The One Stock Rule.** Card stock is `#faf8f3` on both tables and its ink is `#161616` on both tables. A theme change recolors the table, never the cards.

**The Grade Law.** A grade's color is the same everywhere it appears: chip, progress key, due badge, results pile, tally. Again red, Hard orange, Good green, Easy blue. No fifth grade color, no re-mapping per screen.

**The Table Text Rule.** Accent-colored text on the baize uses the table-tinted variants (`*-blue-text`, `*-red-text`, `*-good-text`, `*-hard-text`); the raw inks are for stock and chips only.

## Typography

**Display Font:** Barlow Condensed (with Barlow, system-ui, sans-serif), self-hosted woff2 at 600 and 700
**Body Font:** Barlow (with system-ui, sans-serif), self-hosted woff2 at 400, 500, 600, 700
**Label/Mono Font:** ui-monospace, SF Mono, Menlo, Consolas, monospace

**Character:** Condensed, upright, tabular. Barlow Condensed does the work of a playing-card rank: every count, index, page number and score is set in it at 700 with tabular numerals. Barlow at 500-600 carries prose and controls. Nothing is uppercase-tracked; buttons keep sentence case.

### Hierarchy
- **Display** (600, 2rem phone / 2.4rem desktop, line-height 1): the view title ("On the table", deck name, "Edit deck"), one per view, top of the content column.
- **Headline** (700, 20-22px, 1.1): section heads on the table ("Missed pile", "Chapters") and the deck name on a chapter list card.
- **Index** (700, 28px on the study card, 22px default, 40px on chapter numbers and results-pile counts, line-height 1, tabular): the corner rank of a card and every big numeral.
- **Question** (600, 22px phone / 26px desktop, 1.3, -0.005em, `text-wrap: balance`): the prompt on the card face, centered.
- **Body** (500, 15px, 1.6; answer prose 16-17px): list rows, answer markdown.
- **Label** (600, 13px, line-height 1): chip captions, streak text, accuracy lines, small buttons. Secondary captions on stock drop to 12.5px muted.
- **Mono** (400, 13.5px, 1.7): the deck source editor; inline `code` at 0.88em in Bicycle Blue.

### Named Rules
**The Rank Rule.** Any number that counts something (index, n/N, due, score, streak, chapter number) is Barlow Condensed 700 with `font-variant-numeric: tabular-nums`. Body Barlow never carries a headline numeral.

**The Sentence Case Rule.** Buttons and labels are sentence case at 600 with 0.01em tracking. No uppercase eyebrows, no kickers.

## Layout

The Shell is a 100dvh column: a 56px header row (brand left, controls and the theme toggle right, 16px padding on phone, 24px from `sm`) above either a scrolling MUI Container (`sm` 600px for study/selector/results, `md` 900px for home and editor; top padding 16/32px, bottom 48/64px) or a fill column for the study view.

Home is a grid of decks at true card ratio: 2 columns on phone, 3 from `sm` (600px), 4 from `md` (900px), gap 16px phone / 24px desktop. The last cell is the dashed upload slot at the same ratio. Above the grid the display title sits left and "Study all due" right, wrapping on narrow widths.

Study fills the viewport. A 6px-tall progress row along the top edge holds one key per card (flex 1, 3px gap, 1px when over 60 cards) and never wraps. Corner readouts: quit top-left, n/N top-right, tally bottom-left, undo bottom-right. Center column: a face-down mini deck (52-60px wide) above the card, the card sized to the viewport (`min(100%, (100dvh - 320px) * 63/88)` on phone, `- 400px` on desktop, max 480px), then a 96px chip row with 16px gaps on phone and 28px on desktop.

Spacing steps observed: 4, 8, 12, 16, 24, 32px; card internal padding 48/26/44 on phone and 56/40/48 on desktop; list rows 16px horizontal, 10-12px vertical.

## Elevation & Depth

Hybrid, physical. Cards are lifted paper on baize; chips and primary buttons are thick objects with a hard edge; the table itself is flat with a low-alpha hover wash. There are no glows, no inner shadows, no blur behind anything.

### Shadow Vocabulary
- **Card at rest** (`box-shadow: 0 1px 0 rgba(0,0,0,0.12), 0 8px 18px -6px rgba(0,0,0,0.28)`): every face-up card, list card, tally pad, and card back.
- **Card lifted** (`box-shadow: 0 1px 0 rgba(0,0,0,0.12), 0 14px 24px -8px rgba(0,0,0,0.35)`): hover on a deck back (with `translateY(-4px) rotate(-1deg)`) or a chapter list card (`translateY(-2px)`).
- **Mini deck** (`box-shadow: 0 1px 0 rgba(0,0,0,0.12), 0 3px 6px -2px rgba(0,0,0,0.25)`): the small face-down pile the next card is dealt from.
- **Chip edge** (`box-shadow: 0 3px 0 {edge}, 0 6px 10px -4px rgba(0,0,0,0.35)`): the chip's thickness in its darker edge ink plus a soft drop; pressed becomes `0 0 0 {edge}, 0 2px 4px -2px rgba(0,0,0,0.35)` with `translateY(3px)`.
- **Button edge** (`box-shadow: 0 2px 0 {bicycle-blue-edge}`): contained buttons; pressed collapses to `0 0 0` with `translateY(2px)`.

### Named Rules
**The Edge Is The Press Rule.** Chips and primary buttons show depth as a hard bottom edge in their own darker ink. Pressing moves the object down by exactly the edge height and the edge disappears. The edge is never a decorative offset on a card or a container.

**The Stock Casts, The Table Does Not Rule.** Only card stock (and chips on it) casts a shadow. Nothing on the baize itself (buttons text/outlined, readouts, progress keys) has a shadow.

## Shapes

Playing-card geometry throughout. Cards are 63:88 with 12px corners (`rounded.card`); the mini deck uses 6px; controls and inputs use 8px; progress keys use 4px; chips are perfect circles. Card backs carry a printed frame: a colored outer rect, a white inset, then a patterned field (lattice, diamonds, dots or plaid, tile 8-14, rotated 0/30/45/90) chosen by hashing the deck name, ruled with a 0.8-unit stroke. Ribbons across a back are full-bleed stock strips with 1.5px `card-rule` top and bottom strokes. Borders on stock are 1.5px hairlines; inputs are 1.5px outlined. The upload slot and the empty results pile are 2px dashed outlines in the table rule color at card ratio. Corner indices sit at 12px/14px from the corner, the bottom-right one rotated 180 degrees.

## Components

### Buttons
Flat, sentence case, quick to press.
- **Shape:** softly rounded (8px), no ripple, no elevation.
- **Primary (contained):** Bicycle Blue fill, white text, 2px hard bottom edge in blue-edge; typical padding 8.8px 20px at 15-16px. Hover to `bicycle-blue-hover`; active pushes down 2px and drops the edge (60ms). Disabled turns to the table rule with muted text and no edge.
- **Outlined:** 1.5px stroke and text in the table text color; hover adds the table hover wash.
- **Text:** muted table text; hover to full table text, no background. Used for "Example deck", "All decks", back arrows, undo, select-all.
- **Focus:** 2px solid ring in the table focus color, 2px offset (global `:focus-visible`).

### Chips (poker chips)
The grade control, the streak counter, the due badge, the tally markers, the play affordance.
- **Style:** a circle in the grade or Bicycle ink, white Barlow Condensed 700 numeral at 0.42 x size, SVG rim of 8 white dashes (r 44, stroke 7, dash 17.3) and a thin inner ring at 55% white, hard edge in the matching `-edge` ink.
- **Sizes:** 64px grade chips (label beneath at 13/600), 40px play chip, 34px due badge (overhanging the deck corner by 10px), 26px streak, 22px tally markers.
- **State:** hover brightens 8%; active pushes 3px and collapses the edge; disabled has no pointer. Grade chips exist only after the flip: they slide up 14px and fade in over 180ms.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** card stock, ink near-black, both tables.
- **Shadow Strategy:** card at rest; lifted on hover for clickable cards.
- **Border:** none on the outside; 1.5px card-rule dividers inside lists.
- **Internal Padding:** study face 48/26/44 phone, 56/40/48 desktop; list rows 16px x 10-12px; editor 16/24px; tally pad 20px x 12px.
- **Variants:** study card (perspective 1600px, flips 450ms about Y, backface hidden; front has near-black indices, back has Bicycle Blue indices and markdown prose with `code` in blue on `#eef1f7` and `pre` on `#f1f0ec`), deck back (procedural pattern + name ribbon), list card (chapter rows with a 22x30 3px-radius card-shaped checkbox), tally pad ("This round" with a 2px ink total rule), results pile (stacked backs offset 3px per depth with a big ribbon count in grade color).

### Inputs / Fields
- **Style:** card stock fill, near-black ink, 1.5px card-rule outline, 8px radius, placeholder in muted card ink, blue caret.
- **Focus:** outline shifts to Bicycle Blue at 1.5px; label turns blue.
- **Hover:** outline to muted card ink.
- **Editor:** multiline in system mono 13.5/1.7 on `#faf9f6`.

### Navigation
The Shell header is the only navigation: Brand (26px logo mark that tilts -6 degrees on hover, wordmark in Barlow Condensed 700 21px) left; on the right a small text button, optional streak chip, and the theme toggle (small icon button in muted table text, hover to full text with the hover wash; sun/moon outline icon at 20px). Back navigation is a text button with a leading arrow. No bars, no tabs, no drawers.

### Progress Keys
A row of 6px-tall, 4px-radius keys along the top of the study view, one per card. Unanswered keys are the table rule color, the current key is the table text color, answered keys are lit in the grade ink. Color changes over 200ms.

### Motion
- **Deal:** `@keyframes deal` from `translateY(-64px) scale(0.6) rotate(-2deg)` at 0 opacity, 260ms `cubic-bezier(0.2, 0.8, 0.2, 1)`, on each new card.
- **Flip:** 450ms `cubic-bezier(0.4, 0.1, 0.2, 1)`, whole card about its vertical axis.
- **Chips in:** 180ms `cubic-bezier(0.2, 0.8, 0.2, 1)` translate + 150ms fade.
- **Press:** 60ms transform and edge collapse. Lifts 150ms.
- All motion collapses to 0.01ms under `prefers-reduced-motion: reduce`.

## Do's and Don'ts

### Do:
- **Do** put every face-up surface on card stock (`#faf8f3`) with near-black ink, in both themes.
- **Do** color any grade or accuracy with the Grade Law inks and the matching `-edge` for chips.
- **Do** set every count in Barlow Condensed 700 with tabular numerals.
- **Do** use the poker chip for anything round and pressable or countable; the 8-dash rim is part of the component.
- **Do** keep cards at 63:88 with 12px corners, and give the bottom-right index a 180 degree turn.
- **Do** keep readouts in the corners of a view and the cards in the center.
- **Do** use the table-tinted `*-text` variants for accent text on the baize.

### Don't:
- **Don't** use gold, neon, gradients, glass, blur or glow anywhere.
- **Don't** tint card stock or card ink with the theme; only the table changes.
- **Don't** invent a fifth grade color or re-map a grade's color per screen.
- **Don't** put a shadow on anything that is not card stock or a chip; text and outlined buttons stay flat on the table.
- **Don't** use hard offset edges on cards or containers; the edge belongs to chips and primary buttons only, and it collapses on press.
- **Don't** add uppercase eyebrows, kickers, or tracked labels; buttons are sentence case.
- **Don't** add ripple, elevation, or partial reveal to the flip; one gesture turns the whole card.
