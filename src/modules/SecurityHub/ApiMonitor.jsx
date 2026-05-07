// SecurityHub/ApiMonitor.jsx — developer API key & token tracker with expiry alerts
import { useState } from 'react'
import {
  Box, Paper, Typography, TextField, Button, IconButton, Chip,
  Select, MenuItem, InputAdornment, LinearProgress, Alert, Grid, Tooltip
} from '@mui/material'
import { Add, Visibility, VisibilityOff, ContentCopy, Delete, Warning, Check, VpnKey } from '@mui/icons-material'
import { strengthScore, strengthLabel } from './crypto'

const SK = 'nex_apikeys'
const load = () => { try { return JSON.parse(localStorage.getItem(SK)) || [] } catch { return [] } }
const save = v => localStorage.setItem(SK, JSON.stringify(v))

const SERVICES = ['GitHub', 'Google Cloud', 'OpenAI', 'AWS', 'Azure', 'Vercel', 'Supabase', 'HuggingFace', 'Custom']
const SVC_COLORS = { GitHub:'#e2e8f0', 'Google Cloud':'#34d399', OpenAI:'#60a5fa', AWS:'#f59e0b', Azure:'#60a5fa', Vercel:'#e2e8f0', Supabase:'#34d399', HuggingFace:'#f59e0b', Custom:'#a78bfa' }

const GLASS = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:3 }

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / 86400000)
}

function ExpiryChip({ days }) {
  if (days === null) return null
  const color = days <= 7 ? '#f87171' : days <= 30 ? '#f59e0b' : '#34d399'
  const label = days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days}d`
  return (
    <Chip label={label} size="small"
      sx={{ height:18, fontSize:9, fontWeight:700, background:`${color}18`, color, border:`1px solid ${color}33` }} />
  )
}

const BLANK = () => ({ id:'', name:'', service:'GitHub', token:'', scope:'', expiresAt:'', notes:'' })

export default function ApiMonitor() {
  const [keys, setKeys] = useState(load)
  const [form, setForm] = useState(BLANK())
  const [adding, setAdding] = useState(false)
  const [revealed, setRevealed] = useState({})
  const [copied, setCopied] = useState({})
  const [search, setSearch] = useState('')

  const upd = next => { setKeys(next); save(next) }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const add = () => {
    if (!form.name.trim() || !form.token.trim()) return
    upd([{ ...form, id: Date.now().toString(), addedAt: Date.now() }, ...keys])
    setForm(BLANK()); setAdding(false)
  }

  const del = id => upd(keys.filter(k => k.id !== id))

  const copy = (id, val) => {
    navigator.clipboard.writeText(val)
    setCopied(c => ({ ...c, [id]: true }))
    setTimeout(() => setCopied(c => ({ ...c, [id]: false })), 1500)
  }

  const expiring = keys.filter(k => { const d = daysUntil(k.expiresAt); return d !== null && d <= 7 })
  const filtered = keys.filter(k => {
    const q = search.toLowerCase()
    return !q || k.name.toLowerCase().includes(q) || k.service.toLowerCase().includes(q)
  })

  return (
    <Box>
      {/* Expiry alerts */}
      {expiring.map(k => {
        const d = daysUntil(k.expiresAt)
        return (
          <Alert key={k.id} severity="warning" icon={<Warning />}
            sx={{ mb:1, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', color:'rgba(255,255,255,0.65)', '& .MuiAlert-icon':{ color:'#f59e0b' } }}>
            <Typography variant="caption" fontWeight={600}>
              {k.name} ({k.service}) — {d < 0 ? 'expired' : d === 0 ? 'expires today' : `expires in ${d} day${d===1?'':'s'}`}
            </Typography>
          </Alert>
        )
      })}

      {/* Toolbar */}
      <Box sx={{ display:'flex', gap:1, mb:1.5, flexWrap:'wrap' }}>
        <TextField size="small" placeholder="Search keys…" value={search} onChange={e => setSearch(e.target.value)} sx={{ flex:1, minWidth:160 }} />
        <Button size="small" startIcon={<Add />} onClick={() => setAdding(a => !a)}
          sx={{ border:'1px solid rgba(96,165,250,0.3)', color:'#60a5fa', '&:hover':{ background:'rgba(96,165,250,0.08)' } }}>
          Add Key
        </Button>
      </Box>

      {/* Add form */}
      {adding && (
        <Paper sx={{ p:2, mb:2 }}>
          <Typography variant="caption" fontWeight={700} sx={{ color:'#60a5fa', display:'block', mb:1.25, letterSpacing:0.5 }}>NEW API KEY / TOKEN</Typography>
          <Box sx={{ display:'flex', gap:1, mb:1 }}>
            <TextField size="small" label="Name / Label" value={form.name} onChange={set('name')} sx={{ flex:2 }} />
            <Select size="small" value={form.service} onChange={set('service')} sx={{ flex:1, fontSize:13 }}>
              {SERVICES.map(s => <MenuItem key={s} value={s} sx={{ fontSize:13 }}>{s}</MenuItem>)}
            </Select>
          </Box>
          <TextField size="small" fullWidth label="Token / Key" type="password" value={form.token} onChange={set('token')} sx={{ mb:1 }} />
          <Box sx={{ display:'flex', gap:1, mb:1 }}>
            <TextField size="small" label="Scope / Permissions" value={form.scope} onChange={set('scope')} sx={{ flex:1 }} placeholder="e.g. repo, read:user" />
            <TextField size="small" label="Expires On" type="date" value={form.expiresAt} onChange={set('expiresAt')} sx={{ flex:1 }}
              InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField size="small" fullWidth label="Notes" value={form.notes} onChange={set('notes')} sx={{ mb:1.5 }} />
          <Box sx={{ display:'flex', gap:1, justifyContent:'flex-end' }}>
            <Button size="small" onClick={() => setAdding(false)} sx={{ color:'rgba(255,255,255,0.3)' }}>Cancel</Button>
            <Button size="small" variant="contained" onClick={add}
              disabled={!form.name.trim() || !form.token.trim()}
              sx={{ background:'rgba(96,165,250,0.2)', color:'#60a5fa', '&:hover':{ background:'rgba(96,165,250,0.35)' }, '&.Mui-disabled':{ opacity:0.3 } }}>
              Save
            </Button>
          </Box>
        </Paper>
      )}

      {/* Key grid */}
      <Grid container spacing={1.25}>
        {filtered.length === 0 && (
          <Grid item xs={12}><Typography sx={{ color:'rgba(255,255,255,0.2)', textAlign:'center', py:5 }}>No API keys saved. Click Add Key.</Typography></Grid>
        )}
        {filtered.map(k => {
          const days = daysUntil(k.expiresAt)
          const isRevealed = revealed[k.id]
          const wasCopied = copied[k.id]
          const score = strengthScore(k.token)
          const { color } = strengthLabel(score)
          const masked = k.token.slice(0, 6) + '••••••••••••' + k.token.slice(-4)
          return (
            <Grid item xs={12} sm={6} key={k.id}>
              <Paper sx={{ p:1.75, transition:'background 0.2s', '&:hover':{ background:'rgba(255,255,255,0.07)' } }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                  <VpnKey sx={{ fontSize:16, color: SVC_COLORS[k.service]||'#94a3b8' }} />
                  <Box sx={{ flex:1, minWidth:0 }}>
                    <Typography fontWeight={700} sx={{ color:'rgba(255,255,255,0.85)', fontSize:14 }} noWrap>{k.name}</Typography>
                    <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>{k.service}{k.scope ? ` · ${k.scope}` : ''}</Typography>
                  </Box>
                  {days !== null && <ExpiryChip days={days} />}
                  {days !== null && days <= 30 && <Warning sx={{ fontSize:16, color: days<=7?'#f87171':'#f59e0b' }} />}
                </Box>

                {/* Token row */}
                <Box sx={{ display:'flex', alignItems:'center', gap:0.5, background:'rgba(255,255,255,0.04)', borderRadius:2, px:1, py:0.75, mb:0.75 }}>
                  <Typography variant="caption" sx={{ flex:1, fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.55)', wordBreak:'break-all' }}>
                    {isRevealed ? k.token : masked}
                  </Typography>
                  <IconButton size="small" onClick={() => setRevealed(r => ({ ...r, [k.id]:!r[k.id] }))} sx={{ p:0.4, color:'rgba(255,255,255,0.25)', '&:hover':{ color:'#60a5fa' } }}>
                    {isRevealed ? <VisibilityOff sx={{fontSize:14}}/> : <Visibility sx={{fontSize:14}}/>}
                  </IconButton>
                  <IconButton size="small" onClick={() => copy(k.id, k.token)} sx={{ p:0.4, color:wasCopied?'#34d399':'rgba(255,255,255,0.25)' }}>
                    {wasCopied ? <Check sx={{fontSize:14}}/> : <ContentCopy sx={{fontSize:14}}/>}
                  </IconButton>
                </Box>

                {/* Strength bar */}
                <LinearProgress variant="determinate" value={score}
                  sx={{ height:3, borderRadius:2, mb:0.5, background:'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar':{ background:color, borderRadius:2 } }} />

                {k.notes && <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.3)', fontSize:10, display:'block', mb:0.5 }}>{k.notes}</Typography>}

                <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
                  <IconButton size="small" onClick={() => del(k.id)} sx={{ color:'rgba(255,255,255,0.12)', '&:hover':{ color:'#f87171' } }}><Delete sx={{fontSize:14}}/></IconButton>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
