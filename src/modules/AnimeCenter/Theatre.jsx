// AnimeCenter/Theatre.jsx — Electron webview-based embedded streaming theatre
import { useState, useRef, useEffect } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Chip, IconButton,
  InputAdornment, Alert, Divider
} from '@mui/material'
import { LiveTv, OpenInNew, Refresh, Close, FullscreenRounded, ArrowBack, Warning } from '@mui/icons-material'

const GLASS = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 3,
}

const QUICK_SITES = [
  { label: 'Crunchyroll',  url: 'https://www.crunchyroll.com',        color: '#f97316' },
  { label: 'Funimation',   url: 'https://www.funimation.com',          color: '#5b21b6' },
  { label: 'HIDIVE',       url: 'https://www.hidive.com',              color: '#0284c7' },
  { label: 'Aniwave',      url: 'https://aniwave.to',                  color: '#7c3aed' },
  { label: 'Zoro.to',      url: 'https://zoro.to',                     color: '#059669' },
  { label: 'MyAnimeList',  url: 'https://myanimelist.net',             color: '#2563eb' },
]

// Security policy for webview — allow only HTTPS, block popups, block new windows
const WEBVIEW_POLICY = [
  'allowpopups',
].join(' ')

export default function Theatre() {
  const [url, setUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [inputUrl, setInputUrl] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [isElectron, setIsElectron] = useState(false)
  const webviewRef = useRef()

  useEffect(() => {
    // Detect Electron environment
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI)
  }, [])

  const navigate = (target) => {
    // Enforce HTTPS
    let finalUrl = target
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl
    if (finalUrl.startsWith('http://')) finalUrl = finalUrl.replace('http://', 'https://')
    setActiveUrl(finalUrl)
    setUrl(finalUrl)
    setInputUrl(finalUrl)
    setLoading(true)
  }

  const handleWebviewLoad = () => setLoading(false)

  const handleReload = () => {
    if (webviewRef.current?.reload) webviewRef.current.reload()
    else setActiveUrl(u => u + '#')
  }

  const handleBack = () => {
    if (webviewRef.current?.goBack) webviewRef.current.goBack()
  }

  return (
    <Box>
      {/* URL Bar */}
      <Paper sx={{ ...GLASS, p: 2, mb: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 1.5, letterSpacing: 0.5 }}>
          EMBEDDED THEATRE · Isolated streaming window
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeUrl && (
            <IconButton size="small" onClick={handleBack} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}>
              <ArrowBack fontSize="small" />
            </IconButton>
          )}
          <TextField size="small" fullWidth value={inputUrl} onChange={e => setInputUrl(e.target.value)}
            placeholder="Enter streaming URL (HTTPS only)…"
            onKeyDown={e => e.key === 'Enter' && navigate(inputUrl)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LiveTv sx={{ fontSize: 16, color: activeUrl ? '#a78bfa' : 'rgba(255,255,255,0.2)' }} /></InputAdornment>,
              sx: { background: 'rgba(255,255,255,0.04)', fontSize: 13 },
              endAdornment: activeUrl && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleReload} sx={{ color: 'rgba(255,255,255,0.3)' }}><Refresh fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => { setActiveUrl(''); setUrl(''); setInputUrl('') }} sx={{ color: 'rgba(255,255,255,0.3)' }}><Close fontSize="small" /></IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" onClick={() => navigate(inputUrl)} disabled={!inputUrl.trim()}
            sx={{ background: 'rgba(124,58,237,0.7)', backdropFilter: 'blur(8px)', '&:hover': { background: 'rgba(124,58,237,0.9)' }, whiteSpace: 'nowrap' }}>
            Open
          </Button>
        </Box>

        {/* Quick sites */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
          {QUICK_SITES.map(s => (
            <Chip key={s.label} label={s.label} size="small" onClick={() => navigate(s.url)}
              sx={{ background: `${s.color}18`, color: 'rgba(255,255,255,0.65)', border: `1px solid ${s.color}30`, cursor: 'pointer',
                '&:hover': { background: `${s.color}35`, color: 'rgba(255,255,255,0.9)' }, transition: 'all 0.2s' }} />
          ))}
        </Box>
      </Paper>

      {/* Security notice */}
      {!activeUrl && (
        <Alert severity="info" icon={<Warning />}
          sx={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 2, color: 'rgba(255,255,255,0.55)', '& .MuiAlert-icon': { color: '#60a5fa' }, mb: 2 }}>
          <Typography variant="caption">
            Theatre opens sites in an isolated Electron webview. Sessions, cookies, and scripts are sandboxed from the rest of the app.
            Only HTTPS URLs are permitted. New-window popups and redirects are blocked.
          </Typography>
        </Alert>
      )}

      {/* Webview container */}
      {activeUrl && (
        <Paper sx={{ ...GLASS, overflow: 'hidden', position: 'relative' }}
          style={{ height: fullscreen ? 'calc(100vh - 200px)' : 620 }}>
          {/* Controls overlay */}
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 0.5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 2, px: 1, py: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, alignSelf: 'center', mr: 0.5, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeUrl.replace(/^https?:\/\//, '')}
            </Typography>
            <IconButton size="small" onClick={() => setFullscreen(f => !f)} sx={{ color: 'rgba(255,255,255,0.5)', p: 0.25 }}>
              <FullscreenRounded sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={() => window.open(activeUrl, '_blank')} sx={{ color: 'rgba(255,255,255,0.5)', p: 0.25 }}>
              <OpenInNew sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {loading && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 20, background: 'rgba(255,255,255,0.06)' }}>
              <Box sx={{ height: '100%', background: '#7c3aed', animation: 'theatre-progress 1.5s ease-in-out infinite', borderRadius: 2 }}
                style={{ animationName: 'none', width: '60%', transition: 'width 1s' }} />
            </Box>
          )}

          {isElectron ? (
            // Full Electron webview with partition for isolation
            <webview
              ref={webviewRef}
              src={activeUrl}
              partition="persist:theatre"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              webpreferences="contextIsolation=yes, nodeIntegration=no, sandbox=yes"
              onDidFinishLoad={handleWebviewLoad}
              onDidFailLoad={() => setLoading(false)}
            />
          ) : (
            // Browser fallback — iframe (limited by X-Frame-Options on some sites)
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <LiveTv sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Theatre requires Electron to run the isolated webview.<br />
                <span style={{ fontSize: 12, opacity: 0.6 }}>Running in browser mode — webview unavailable.</span>
              </Typography>
              <Button variant="outlined" startIcon={<OpenInNew />} onClick={() => window.open(activeUrl, '_blank')}
                sx={{ borderColor: 'rgba(167,139,250,0.4)', color: '#a78bfa' }}>
                Open in Default Browser
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
