// SecurityHub/Generator.jsx — password generator + real-time strength analyzer
import { useState, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Slider, Switch,
  FormControlLabel, LinearProgress, IconButton, Chip, InputAdornment, Tooltip
} from '@mui/material'
import { Refresh, ContentCopy, Check, Visibility, VisibilityOff } from '@mui/icons-material'
import { generatePassword, strengthScore, strengthLabel } from './crypto'

const GLASS_INNER = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, p:1.5 }

const HISTORY_KEY = 'nex_genhist'
const loadHist = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] } catch { return [] } }

export default function Generator() {
  const [opts, setOpts] = useState({ length:18, upper:true, lower:true, digits:true, symbols:true })
  const [generated, setGenerated] = useState(() => generatePassword({ length:18, upper:true, lower:true, digits:true, symbols:true }))
  const [custom, setCustom]   = useState('')
  const [showGen, setShowGen] = useState(true)
  const [copied, setCopied]   = useState({})
  const [history, setHistory] = useState(loadHist)

  const setOpt = k => v => setOpts(o => ({ ...o, [k]: v }))

  const regen = useCallback(() => {
    const pw = generatePassword(opts)
    setGenerated(pw)
    const next = [{ pw, ts: Date.now() }, ...history].slice(0, 12)
    setHistory(next)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  }, [opts, history])

  const copy = (key, val) => {
    navigator.clipboard.writeText(val)
    setCopied(c => ({ ...c, [key]: true }))
    setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 1500)
  }

  const target = custom || generated
  const score  = strengthScore(target)
  const { label, color } = strengthLabel(score)

  const ToggleRow = ({ label, field }) => (
    <FormControlLabel
      control={<Switch size="small" checked={opts[field]} onChange={e => setOpt(field)(e.target.checked)}
        sx={{ '& .MuiSwitch-thumb':{ background: opts[field] ? '#60a5fa' : 'rgba(255,255,255,0.2)' }, '& .MuiSwitch-track':{ background: opts[field] ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.06)' } }} />}
      label={<Typography variant="caption" sx={{ color:'rgba(255,255,255,0.55)', fontSize:12 }}>{label}</Typography>}
      sx={{ m:0 }} />
  )

  return (
    <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>

      {/* ── Generator widget ── */}
      <Paper sx={{ p:2.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color:'rgba(255,255,255,0.4)', letterSpacing:0.5, display:'block', mb:2 }}>GENERATE PASSWORD</Typography>

        {/* Output */}
        <Box sx={{ ...GLASS_INNER, display:'flex', alignItems:'center', gap:1, mb:2 }}>
          <Typography sx={{ flex:1, fontFamily:'monospace', fontSize:15, color:'rgba(255,255,255,0.85)', letterSpacing:1, wordBreak:'break-all' }}>
            {showGen ? generated : '•'.repeat(generated.length)}
          </Typography>
          <IconButton size="small" onClick={() => setShowGen(s => !s)} sx={{ color:'rgba(255,255,255,0.25)', '&:hover':{ color:'#60a5fa' } }}>
            {showGen ? <VisibilityOff sx={{fontSize:16}}/> : <Visibility sx={{fontSize:16}}/>}
          </IconButton>
          <Tooltip title="Copy"><IconButton size="small" onClick={() => copy('gen', generated)} sx={{ color:copied.gen?'#34d399':'rgba(255,255,255,0.3)', '&:hover':{ color:'#34d399' } }}>
            {copied.gen ? <Check sx={{fontSize:16}}/> : <ContentCopy sx={{fontSize:16}}/>}
          </IconButton></Tooltip>
          <Tooltip title="Regenerate"><IconButton size="small" onClick={regen} sx={{ color:'rgba(255,255,255,0.3)', '&:hover':{ color:'#60a5fa' } }}>
            <Refresh sx={{fontSize:16}}/>
          </IconButton></Tooltip>
        </Box>

        {/* Strength bar */}
        <Box sx={{ mb:2 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
            <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>Strength</Typography>
            <Chip label={label} size="small" sx={{ height:18, fontSize:10, fontWeight:700, background:`${color}18`, color }} />
          </Box>
          <LinearProgress variant="determinate" value={score}
            sx={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar':{ background:color, borderRadius:3, transition:'width 0.4s' } }} />
        </Box>

        {/* Options */}
        <Box sx={{ display:'flex', gap:1, alignItems:'center', mb:1.5 }}>
          <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.4)', minWidth:52 }}>Length: {opts.length}</Typography>
          <Slider value={opts.length} min={8} max={64} onChange={(_, v) => setOpt('length')(v)} size="small"
            sx={{ flex:1, color:'#60a5fa', '& .MuiSlider-thumb':{ width:14, height:14 }, '& .MuiSlider-rail':{ background:'rgba(255,255,255,0.08)' } }} />
        </Box>

        <Box sx={{ display:'flex', gap:2, flexWrap:'wrap', mb:2 }}>
          <ToggleRow label="Uppercase (A-Z)" field="upper" />
          <ToggleRow label="Lowercase (a-z)" field="lower" />
          <ToggleRow label="Digits (0-9)"    field="digits" />
          <ToggleRow label="Symbols (!@#…)"  field="symbols" />
        </Box>

        <Button fullWidth variant="contained" startIcon={<Refresh />} onClick={regen}
          sx={{ background:'rgba(96,165,250,0.15)', color:'#60a5fa', border:'1px solid rgba(96,165,250,0.25)', '&:hover':{ background:'rgba(96,165,250,0.3)' } }}>
          Generate New Password
        </Button>
      </Paper>

      {/* ── Strength Analyzer ── */}
      <Paper sx={{ p:2.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color:'rgba(255,255,255,0.4)', letterSpacing:0.5, display:'block', mb:1.5 }}>ANALYZE YOUR PASSWORD</Typography>
        <TextField fullWidth size="small" type="password" placeholder="Type or paste a password to analyze…"
          value={custom} onChange={e => setCustom(e.target.value)} sx={{ mb:1.5 }} />

        {custom && (
          <>
            <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
              <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.35)' }}>Score: {score}/100</Typography>
              <Chip label={label} size="small" sx={{ height:18, fontSize:10, fontWeight:700, background:`${color}18`, color }} />
            </Box>
            <LinearProgress variant="determinate" value={score}
              sx={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar':{ background:color, borderRadius:4, transition:'width 0.4s' } }} />
            <Box sx={{ display:'flex', gap:0.75, mt:1.5, flexWrap:'wrap' }}>
              {[
                [custom.length >= 8,  '8+ chars'],
                [custom.length >= 14, '14+ chars'],
                [custom.length >= 20, '20+ chars'],
                [/[A-Z]/.test(custom), 'Uppercase'],
                [/[a-z]/.test(custom), 'Lowercase'],
                [/[0-9]/.test(custom), 'Digits'],
                [/[^A-Za-z0-9]/.test(custom), 'Symbols'],
              ].map(([pass, label]) => (
                <Chip key={label} label={label} size="small"
                  sx={{ height:20, fontSize:10, background: pass?'rgba(52,211,153,0.12)':'rgba(255,255,255,0.04)', color: pass?'#34d399':'rgba(255,255,255,0.25)', border:`1px solid ${pass?'rgba(52,211,153,0.25)':'transparent'}` }} />
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* ── Recent history ── */}
      {history.length > 0 && (
        <Paper sx={{ p:2 }}>
          <Typography variant="caption" fontWeight={700} sx={{ color:'rgba(255,255,255,0.4)', letterSpacing:0.5, display:'block', mb:1 }}>RECENT GENERATED</Typography>
          <Box sx={{ display:'flex', flexDirection:'column', gap:0.5 }}>
            {history.slice(0,8).map((h, i) => {
              const s = strengthScore(h.pw); const { color:c } = strengthLabel(s)
              return (
                <Box key={i} sx={{ display:'flex', alignItems:'center', gap:1, ...GLASS_INNER, py:0.75 }}>
                  <Box sx={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0 }} />
                  <Typography variant="caption" sx={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.5)', flex:1, letterSpacing:0.5 }} noWrap>
                    {'•'.repeat(8) + h.pw.slice(-6)}
                  </Typography>
                  <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.2)', fontSize:10 }}>
                    {new Date(h.ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </Typography>
                  <IconButton size="small" onClick={() => copy(i, h.pw)} sx={{ p:0.3, color:copied[i]?'#34d399':'rgba(255,255,255,0.2)' }}>
                    {copied[i] ? <Check sx={{fontSize:13}}/> : <ContentCopy sx={{fontSize:13}}/>}
                  </IconButton>
                </Box>
              )
            })}
          </Box>
        </Paper>
      )}
    </Box>
  )
}
