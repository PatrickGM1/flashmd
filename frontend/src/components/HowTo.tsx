import { useState } from 'react'
import { Box, Typography, Button, Dialog, DialogContent, IconButton } from '@mui/material'
import { HelpOutlineRounded, CloseRounded } from '@mui/icons-material'
import { ink, gradeInk, gradeEdge } from '../ui'
import { fonts } from '../theme'
import { useAuth } from '../auth'
import { Chip } from './cards'

/** The rules card: a help button in the header that opens one clear explanation of the whole app. */
export default function HowTo() {
  const [open, setOpen] = useState(false)
  const { me } = useAuth()
  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)} aria-label="How to use flashmd" title="How to use">
        <HelpOutlineRounded sx={{ fontSize: 21 }} />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)} scroll="body" PaperProps={{ sx: { maxWidth: 640, width: '100%', m: { xs: 1.5, sm: 4 } } }}>
        <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, pb: { xs: 3, sm: 4 } }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} mb={2.5}>
            <Box>
              <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 32, lineHeight: 1 }}>How to use flashmd</Typography>
              <Typography sx={{ fontSize: 14, color: ink.cardMuted, mt: 0.75 }}>
                Write questions in a markdown file, upload it, and drill it. The app remembers what you get wrong.
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close" sx={{ color: ink.cardMuted, mt: -0.5, mr: -1 }}><CloseRounded /></IconButton>
          </Box>

          <Section n={1} title="Write a deck">
            <P>One <Code>.md</Code> file is one deck. A <Code># Heading</Code> starts a chapter, a <Code>## Heading</Code> is a question, and everything below it until the next heading is the answer.</P>
            <Pre>{`# Chapter 1: Ancient History

## Who built the Great Pyramid of Giza?

The Egyptians, around 2560 BC.
Answers can span several lines and use **bold**, lists and \`code\`.

## What was the Roman Empire at its peak?

The largest empire in the ancient world.`}</Pre>
            <P>Chapters are optional; cards before any <Code>#</Code> land in "Uncategorized". A question with an empty answer is skipped. Any editor works: Obsidian, VS Code, Notes, whatever you already write in.</P>
          </Section>

          <Section n={2} title="Put it on the table">
            <P>On the home table, drop the file on the dashed <B>Add a deck</B> card or click it. No file yet? <B>Example deck</B> loads a small one so you can try the loop first. Each deck shows as a face-down card with its name; a red chip in the corner counts cards that are due.</P>
          </Section>

          <Section n={3} title="Deal a session">
            <P>Open a deck to <B>cut it</B>: tick the chapters you want, or type a number in <B>Deal only</B> to get a random hand of that size. <B>Due for review</B> deals only the cards the schedule says you should see today, weakest first. On the home table, <B>Study all due</B> does that across every deck at once.</P>
          </Section>

          <Section n={4} title="Flip and grade">
            <P>Read the question, flip the card, then grade yourself honestly with a chip:</P>
            <Box display="flex" gap={{ xs: 1.5, sm: 2.5 }} flexWrap="wrap" my={1.5}>
              {([['AGAIN', '1', 'Again', 'Did not know it. Comes back very soon.'], ['HARD', '2', 'Hard', 'Got it, barely. Comes back soon.'], ['GOOD', '3', 'Good', 'Knew it. Waits longer next time.'], ['EASY', '4', 'Easy', 'Trivial. Waits much longer.']] as const).map(([g, cap, label, desc]) => (
                <Box key={g} display="flex" alignItems="center" gap={1.25} sx={{ flex: '1 1 220px' }}>
                  <Chip color={gradeInk[g]} edge={gradeEdge[g]} size={40} sx={{ fontSize: 17 }}>{cap}</Chip>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{label}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: ink.cardMuted, lineHeight: 1.3 }}>{desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <P>This is spaced repetition (Leitner boxes): every card sits in a box, a good grade moves it up a box and it waits longer, <B>Again</B> drops it back to the first box. The row of keys along the top lights up in the color of each grade as you go. Misgraded? <B>Undo</B> takes the last chip back.</P>
          </Section>

          <Section n={5} title="Keyboard">
            <Box display="grid" gridTemplateColumns="auto 1fr" columnGap={2.5} rowGap={0.75} sx={{ fontSize: 14, alignItems: 'baseline' }}>
              <Key>Space</Key><span>Flip the card (also <Kbd>Enter</Kbd> or tap)</span>
              <Key>1 2 3 4</Key><span>Again · Hard · Good · Easy</span>
              <Key>U</Key><span>Undo the last grade (also <Kbd>Backspace</Kbd>)</span>
              <Key>Esc</Key><span>Quit the session</span>
            </Box>
            <P>On a phone the chips sit under your thumb; no keyboard needed.</P>
          </Section>

          <Section n={6} title="After the round">
            <P>Cards land in two piles, <B>Knew</B> and <B>Missed</B>, with the score on the pad. <B>Deal the missed again</B> replays only those. Progress is saved to your account the moment the round ends. Study on consecutive days and the chip next to your name counts the <B>streak</B>.</P>
          </Section>

          <Section n={7} title="Edit, export, reset">
            <P>Inside a deck, <B>Edit</B> opens the markdown in the app. Save keeps progress for every question you did not rename. <B>Export .md</B> gives the file back so nothing is ever locked in. <B>Reset progress</B> forgets every grade for that deck; deleting a deck (trash icon on the home table) removes it entirely.</P>
          </Section>

          <Section n={8} title="Your account">
            <P>Your decks and streak are yours alone. From the chip with your initial in the top-right you can change your password or sign out. <B>Keep me signed in</B> on the sign-in page keeps you in for 30 days.</P>
            <P>Forgot your password? There is no email reset. Ask an admin: they set you a temporary password, you sign in with it and pick a new one.</P>
            {me?.role === 'ADMIN' && (
              <P><B>You are an admin.</B> <B>Accounts</B> in your menu lists every user: open their decks, reset a password (the temporary one is shown once, hand it over), make someone admin, or delete an account with all its decks.</P>
            )}
          </Section>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button variant="contained" onClick={() => setOpen(false)}>Got it</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ pt: 2.25, mt: 2.25, borderTop: `1.5px solid ${ink.cardRule}`, '&:first-of-type': { borderTop: 'none', pt: 0, mt: 0 } }}>
      <Box display="flex" alignItems="baseline" gap={1.25} mb={1}>
        <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 22, lineHeight: 1, color: ink.blue, fontVariantNumeric: 'tabular-nums' }}>{n}</Typography>
        <Typography sx={{ fontFamily: fonts.index, fontWeight: 700, fontSize: 22, lineHeight: 1 }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  )
}

const P = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: 14.5, lineHeight: 1.6, mb: 1, '&:last-child': { mb: 0 } }}>{children}</Typography>
)
const B = ({ children }: { children: React.ReactNode }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>
const Code = ({ children }: { children: React.ReactNode }) => (
  <Box component="code" sx={{ fontFamily: fonts.mono, fontSize: '0.88em', bgcolor: '#eef1f7', color: ink.blue, px: 0.6, py: 0.2, borderRadius: '4px' }}>{children}</Box>
)
const Kbd = ({ children }: { children: React.ReactNode }) => (
  <Box component="kbd" sx={{ fontFamily: fonts.mono, fontSize: '0.85em', border: `1px solid ${ink.cardRule}`, borderBottomWidth: 2, borderRadius: '4px', px: 0.6, py: 0.1, bgcolor: '#faf9f6' }}>{children}</Box>
)
const Key = ({ children }: { children: React.ReactNode }) => (
  <Box display="flex" gap={0.5} flexWrap="wrap">{String(children).split(' ').map(k => <Kbd key={k}>{k}</Kbd>)}</Box>
)
const Pre = ({ children }: { children: string }) => (
  <Box component="pre" sx={{ fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 1.6, bgcolor: '#f1f0ec', border: `1px solid ${ink.cardRule}`, borderRadius: '8px', p: 1.5, my: 1.25, overflowX: 'auto', whiteSpace: 'pre', m: 0, mb: 1.25 }}>{children}</Box>
)
