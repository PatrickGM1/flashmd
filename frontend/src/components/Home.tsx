import { useRef, useState } from 'react'
import {
  Box, Typography, Paper, Button, TextField,
  InputAdornment, Divider, Alert, CircularProgress,
} from '@mui/material'
import { Upload, LinkOutlined, StyleOutlined } from '@mui/icons-material'
import { Chapter } from '../types'
import { parseDeck } from '../utils/parser'

interface Props {
  onDeckLoaded: (chapters: Chapter[]) => void
}

export default function Home({ onDeckLoaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadContent = (content: string, source: string) => {
    const chapters = parseDeck(content)
    if (chapters.length === 0) {
      setError(`No valid flashcards found in "${source}". Check the format.`)
      return
    }
    onDeckLoaded(chapters)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => loadContent(ev.target?.result as string, file.name)
    reader.readAsText(file)
  }

  const handleUrl = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/fetch-deck?url=${encodeURIComponent(url.trim())}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      loadContent(await res.text(), url)
    } catch {
      setError('Failed to load URL. Make sure it points to a raw .md file.')
    } finally {
      setLoading(false)
    }
  }

  const handleExample = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/example.md')
      loadContent(await res.text(), 'example.md')
    } catch {
      setError('Failed to load example deck.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={2}
      bgcolor="background.default"
    >
      <Box width="100%" maxWidth={480}>
        {/* Logo */}
        <Box textAlign="center" mb={5}>
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: 'rgba(124,106,247,0.12)',
              border: '1px solid',
              borderColor: 'primary.main',
              mb: 2,
            }}
          >
            <StyleOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
          </Box>
          <Typography variant="h3" fontWeight={800} letterSpacing="-1px">
            flash<span style={{ color: '#7c6af7' }}>md</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Turn any <code style={{ color: '#7c6af7', background: 'rgba(124,106,247,0.12)', padding: '2px 6px', borderRadius: 4 }}>.md</code> file into a flashcard deck
          </Typography>
        </Box>

        {/* Upload */}
        <Paper
          onClick={() => fileInputRef.current?.click()}
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            borderStyle: 'dashed',
            borderColor: '#2a2a2a',
            bgcolor: 'background.paper',
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: 'primary.main' },
            mb: 2,
          }}
        >
          <Upload sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
          <Typography fontWeight={600} color="text.primary">Upload a .md file</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>Click to browse</Typography>
          <input ref={fileInputRef} type="file" accept=".md,text/plain" hidden onChange={handleFile} />
        </Paper>

        {/* Divider */}
        <Divider sx={{ my: 2, borderColor: '#2a2a2a', color: 'text.secondary', fontSize: 12 }}>or</Divider>

        {/* URL */}
        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.paper', borderColor: '#2a2a2a' }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1.5} display="flex" alignItems="center" gap={0.5}>
            <LinkOutlined sx={{ fontSize: 16 }} /> Load from URL
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="https://raw.githubusercontent.com/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUrl()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#0e0e0e',
                  '& fieldset': { borderColor: '#2a2a2a' },
                  '&:hover fieldset': { borderColor: '#7c6af7' },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleUrl}
              disabled={loading || !url.trim()}
              sx={{ minWidth: 80, whiteSpace: 'nowrap' }}
            >
              {loading ? <CircularProgress size={16} color="inherit" /> : 'Load'}
            </Button>
          </Box>
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(211,47,47,0.1)', color: '#f48fb1', border: '1px solid rgba(211,47,47,0.3)' }}>
            {error}
          </Alert>
        )}

        {/* Example link */}
        <Box textAlign="center" mt={3}>
          <Button
            variant="text"
            size="small"
            onClick={handleExample}
            disabled={loading}
            sx={{ color: 'text.secondary', fontSize: 12, '&:hover': { color: 'primary.main' } }}
          >
            Try the example deck
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
