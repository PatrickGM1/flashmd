# flashmd

Flash cards from .md file

# flashmd

Flashcards from a `.md` file.

## Usage

- Upload a `.md` file
- Select chapters to study, or pick N random cards from the whole deck
- Flip cards, mark known/unknown

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

| Element  | Syntax           | Description                         |
| -------- | ---------------- | ----------------------------------- |
| Chapter  | `# Title`        | Groups cards — selectable in the UI |
| Question | `## Text`        | Full line is the question           |
| Answer   | Lines below `##` | Until next `##` or `#`              |

- Chapters are optional — ungrouped cards go to "Uncategorized"
- Answers can be multi-line
