// SecurityHub/Vault.jsx — AES-256 encrypted credential vault
import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, IconButton, Chip,
  Select, MenuItem, InputAdornment, LinearProgress, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Grid
} from '@mui/material'
import {
  Add, Visibility, VisibilityOff, ContentCopy, Delete, LockOpen,
  Lock, Search, Edit, Check
} from '@mui/icons-material'
import { encrypt, decrypt, strengthScore, strengthLabel } from './crypto'

const STORAGE_KEY = 'nex_vault_enc'
const CATS = ['Developer', 'University', 'Gaming', 'Finance', 'Social', 'Work', 'Other']
const CAT_COLORS = { Developer:'#60a5fa', University:'#a78bfa', Gaming:'#34d399', Finance:'#f59e0b', Social:'#f472b6', Work:'#22d3ee', Other:'#94a3b8' }

const GLASS = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:3 }

// ─── Master Password Gate ───────────────────────────────────────
function MasterGate({ onUnlock }) {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [isNew, setIsNew] = useState(!localStorage.getItem(STORAGE_KEY))

  const submit = async () => {
    if (!pw.trim()) return
    if (isNew) {
      // First time — encrypt empty vault with this password
      const enc = await encrypt(JSON.stringify([]), pw)
      localStorage.setItem(STORAGE_KEY, enc)
      onUnlock(pw)
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        await decrypt(raw, pw)   // test-decrypt; throws on wrong key
        onUnlock(pw)
      } catch {
        setError('Wrong master password.')
      }
    }
  }

  return (
    <Box sx={{ maxWidth: 380, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
          <Lock sx={{ color:'#60a5fa' }} />
          <Typography fontWeight={700} sx={{ color:'rgba(255,255,255,0.85)' }}>
            {isNew ? 'Create Master Password' : 'Unlock Vault'}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.4)', mb:2 }}>
          {isNew
            ? 'Your vault is encrypted with AES-256. Set a strong master password — it cannot be recovered.'
            : 'Enter your master password to decrypt the vault.'}
        </Typography>
        <TextField fullWidth size="small" type={show ? 'text' : 'password'} label="Master Password"
          value={pw} onChange={e => { setPw(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          InputProps={{ endAdornment:
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShow(s => !s)} sx={{ color:'rgba(255,255,255,0.3)' }}>
                {show ? <VisibilityOff sx={{fontSize:17}}/> : <Visibility sx={{fontSize:17}}/>}
              </IconButton>
            </InputAdornment>
          }} sx={{ mb: 1.5 }} />
        {error && <Alert severity="error" sx={{ mb:1.5, py:0.5, background:'rgba(248,113,113,0.1)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)' }}>{error}</Alert>}
        <Button fullWidth variant="contained" onClick={submit}
          sx={{ background:'rgba(96,165,250,0.2)', color:'#60a5fa', '&:hover':{ background:'rgba(96,165,250,0.35)' } }}>
          {isNew ? 'Create Vault' : 'Unlock'}
        </Button>
      </Paper>
    </Box>
  )
}

// ─── Strength Bar ───────────────────────────────────────────────
function StrengthBar({ password }) {
  const score = strengthScore(password)
  const { label, color } = strengthLabel(score)
  return (
    <Box sx={{ mt:0.5 }}>
      <LinearProgress variant="determinate" value={score}
        sx={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.06)',
          '& .MuiLinearProgress-bar':{ background:color, borderRadius:2, transition:'width 0.3s' } }} />
      <Typography variant="caption" sx={{ color, fontSize:10 }}>{label}</Typography>
    </Box>
  )
}

// ─── Add / Edit Dialog ──────────────────────────────────────────
const BLANK = () => ({ id:'', site:'', username:'', password:'', category:'Developer', url:'', notes:'' })

function EntryDialog({ open, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || BLANK())
  const [showPw, setShowPw] = useState(false)
  useEffect(() => setForm(initial || BLANK()), [initial])
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx:{ ...GLASS, borderRadius:4 } }}>
      <DialogTitle sx={{ color:'rgba(255,255,255,0.85)', fontWeight:700, pb:1 }}>
        {form.id ? 'Edit Entry' : 'New Entry'}
      </DialogTitle>
      <DialogContent sx={{ display:'flex', flexDirection:'column', gap:1.5, pt:1 }}>
        <Box sx={{ display:'flex', gap:1 }}>
          <TextField size="small" label="Site / Service" value={form.site} onChange={set('site')} sx={{ flex:2 }} />
          <Select size="small" value={form.category} onChange={set('category')} sx={{ flex:1, fontSize:13 }}>
            {CATS.map(c => <MenuItem key={c} value={c} sx={{ fontSize:13 }}>{c}</MenuItem>)}
          </Select>
        </Box>
        <TextField size="small" label="URL (optional)" value={form.url} onChange={set('url')} />
        <TextField size="small" label="Username / Email" value={form.username} onChange={set('username')} />
        <Box>
          <TextField size="small" fullWidth label="Password" type={showPw ? 'text' : 'password'}
            value={form.password} onChange={set('password')}
            InputProps={{ endAdornment:
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPw(s => !s)} sx={{ color:'rgba(255,255,255,0.3)' }}>
                  {showPw ? <VisibilityOff sx={{fontSize:16}}/> : <Visibility sx={{fontSize:16}}/>}
                </IconButton>
              </InputAdornment>
            }} />
          <StrengthBar password={form.password} />
        </Box>
        <TextField size="small" label="Notes (optional)" multiline rows={2} value={form.notes} onChange={set('notes')} />
      </DialogContent>
      <DialogActions sx={{ px:3, pb:2 }}>
        <Button onClick={onClose} sx={{ color:'rgba(255,255,255,0.3)' }}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(form)}
          disabled={!form.site.trim() || !form.password.trim()}
          sx={{ background:'rgba(96,165,250,0.2)', color:'#60a5fa', '&:hover':{ background:'rgba(96,165,250,0.35)' }, '&.Mui-disabled':{ opacity:0.3 } }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Main Vault ─────────────────────────────────────────────────
export default function Vault() {
  const [masterPw, setMasterPw] = useState(null)
  const [entries, setEntries] = useState([])
  const [revealed, setRevealed] = useState({})
  const [copied, setCopied]   = useState({})
  const [search, setSearch]   = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [dialog, setDialog]   = useState({ open: false, entry: null })
  const [saving, setSaving]   = useState(false)

  const loadVault = useCallback(async pw => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const json = await decrypt(raw, pw)
      setEntries(JSON.parse(json))
      setMasterPw(pw)
    } catch { setMasterPw(null) }
  }, [])

  const saveVault = useCallback(async newEntries => {
    setSaving(true)
    const enc = await encrypt(JSON.stringify(newEntries), masterPw)
    localStorage.setItem(STORAGE_KEY, enc)
    setEntries(newEntries)
    setSaving(false)
  }, [masterPw])

  const handleSave = async form => {
    const entry = { ...form, id: form.id || Date.now().toString(), updatedAt: Date.now() }
    const next = form.id ? entries.map(e => e.id === form.id ? entry : e) : [entry, ...entries]
    await saveVault(next)
    setDialog({ open: false, entry: null })
  }

  const del = async id => saveVault(entries.filter(e => e.id !== id))

  const copyPw = (id, pw) => {
    navigator.clipboard.writeText(pw)
    setCopied(c => ({ ...c, [id]: true }))
    setTimeout(() => setCopied(c => ({ ...c, [id]: false })), 1500)
  }

  const toggleReveal = id => setRevealed(r => ({ ...r, [id]: !r[id] }))

  if (!masterPw) return <MasterGate onUnlock={loadVault} />

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    const matchQ = !q || e.site.toLowerCase().includes(q) || e.username.toLowerCase().includes(q)
    const matchC = catFilter === 'All' || e.category === catFilter
    return matchQ && matchC
  })

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display:'flex', gap:1, mb:1.5, flexWrap:'wrap', alignItems:'center' }}>
        <TextField size="small" placeholder="Search vault…" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment:<InputAdornment position="start"><Search sx={{fontSize:16, color:'rgba(255,255,255,0.2)'}}/></InputAdornment> }}
          sx={{ flex:1, minWidth:160 }} />
        <Button size="small" startIcon={<Add />} onClick={() => setDialog({ open:true, entry:null })}
          sx={{ border:'1px solid rgba(96,165,250,0.3)', color:'#60a5fa', '&:hover':{ background:'rgba(96,165,250,0.08)' } }}>
          Add Entry
        </Button>
        <Tooltip title="Lock vault"><IconButton size="small" onClick={() => setMasterPw(null)}
          sx={{ color:'rgba(255,255,255,0.3)', '&:hover':{ color:'#f87171' } }}><Lock sx={{fontSize:18}}/></IconButton></Tooltip>
      </Box>

      {/* Category chips */}
      <Box sx={{ display:'flex', gap:0.75, mb:1.5, flexWrap:'wrap' }}>
        {['All', ...CATS].map(c => (
          <Chip key={c} label={c === 'All' ? `All (${entries.length})` : `${c}`} size="small"
            onClick={() => setCatFilter(c)}
            sx={{ cursor:'pointer', height:22, fontSize:11, transition:'all 0.2s',
              background: catFilter===c ? `${CAT_COLORS[c]||'rgba(255,255,255,0.12)'}22` : 'rgba(255,255,255,0.05)',
              color: catFilter===c ? (CAT_COLORS[c]||'rgba(255,255,255,0.8)') : 'rgba(255,255,255,0.4)',
              border:`1px solid ${catFilter===c ? (CAT_COLORS[c]||'rgba(255,255,255,0.3)')+'44' : 'transparent'}` }} />
        ))}
      </Box>

      {saving && <LinearProgress sx={{ mb:1, borderRadius:1, background:'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar':{ background:'#60a5fa' } }} />}

      {/* Entry grid */}
      <Grid container spacing={1.25}>
        {filtered.length === 0 && (
          <Grid item xs={12}><Typography sx={{ color:'rgba(255,255,255,0.2)', textAlign:'center', py:5 }}>No entries. Click Add Entry to get started.</Typography></Grid>
        )}
        {filtered.map(e => {
          const score = strengthScore(e.password)
          const { color } = strengthLabel(score)
          const isRevealed = revealed[e.id]
          const wasCopied = copied[e.id]
          return (
            <Grid item xs={12} sm={6} md={4} key={e.id}>
              <Paper sx={{ p:1.75, transition:'background 0.2s', '&:hover':{ background:'rgba(255,255,255,0.07)' } }}>
                {/* Header row */}
                <Box sx={{ display:'flex', alignItems:'flex-start', gap:1, mb:1 }}>
                  <Box sx={{ flex:1, minWidth:0 }}>
                    <Typography fontWeight={700} sx={{ color:'rgba(255,255,255,0.85)', fontSize:14 }} noWrap>{e.site}</Typography>
                    <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.4)', fontSize:11 }} noWrap>{e.username}</Typography>
                  </Box>
                  <Chip label={e.category} size="small"
                    sx={{ height:18, fontSize:9, fontWeight:700, background:`${CAT_COLORS[e.category]||'#94a3b8'}18`, color:CAT_COLORS[e.category]||'#94a3b8' }} />
                </Box>

                {/* Password row */}
                <Box sx={{ display:'flex', alignItems:'center', gap:0.5, background:'rgba(255,255,255,0.04)', borderRadius:2, px:1, py:0.75 }}>
                  <Typography variant="caption" sx={{ flex:1, fontFamily:'monospace', fontSize:12, color:'rgba(255,255,255,0.65)', letterSpacing:isRevealed?0.5:2 }}>
                    {isRevealed ? e.password : '•'.repeat(Math.min(e.password.length, 16))}
                  </Typography>
                  <IconButton size="small" onClick={() => toggleReveal(e.id)} sx={{ p:0.4, color:'rgba(255,255,255,0.25)', '&:hover':{ color:'#60a5fa' } }}>
                    {isRevealed ? <VisibilityOff sx={{fontSize:14}}/> : <Visibility sx={{fontSize:14}}/>}
                  </IconButton>
                  <IconButton size="small" onClick={() => copyPw(e.id, e.password)} sx={{ p:0.4, color:wasCopied?'#34d399':'rgba(255,255,255,0.25)', '&:hover':{ color:'#34d399' } }}>
                    {wasCopied ? <Check sx={{fontSize:14}}/> : <ContentCopy sx={{fontSize:14}}/>}
                  </IconButton>
                </Box>

                {/* Strength bar */}
                <Box sx={{ mt:0.75 }}>
                  <LinearProgress variant="determinate" value={score}
                    sx={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar':{ background:color, borderRadius:2 } }} />
                </Box>

                {/* Actions */}
                <Box sx={{ display:'flex', justifyContent:'flex-end', gap:0.25, mt:0.5 }}>
                  <IconButton size="small" onClick={() => setDialog({ open:true, entry:e })} sx={{ color:'rgba(255,255,255,0.2)', '&:hover':{ color:'#60a5fa' } }}><Edit sx={{fontSize:14}}/></IconButton>
                  <IconButton size="small" onClick={() => del(e.id)} sx={{ color:'rgba(255,255,255,0.12)', '&:hover':{ color:'#f87171' } }}><Delete sx={{fontSize:14}}/></IconButton>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      <EntryDialog open={dialog.open} initial={dialog.entry} onSave={handleSave} onClose={() => setDialog({ open:false, entry:null })} />
    </Box>
  )
}
