// AnimeCenter/Tracker.jsx — AniList API + local watch-list manager
import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, TextField, Button, Chip, Avatar, Typography, Grid,
  LinearProgress, Select, MenuItem, FormControl, InputLabel, IconButton,
  Tooltip, Skeleton, InputAdornment
} from '@mui/material'
import { Search, Sync, Star, BookmarkAdd, CheckCircle, Schedule, Pause, OpenInNew } from '@mui/icons-material'

const STORAGE_KEY = 'nex_anime_list'
const ANILIST_API = 'https://graphql.anilist.co'

const STATUS_CONFIG = {
  WATCHING:   { label: 'Watching',   color: '#3b82f6' },
  COMPLETED:  { label: 'Completed',  color: '#10b981' },
  PAUSED:     { label: 'Paused',     color: '#f59e0b' },
  PLANNING:   { label: 'Planning',   color: '#a855f7' },
  DROPPED:    { label: 'Dropped',    color: '#ef4444' },
  MANHWA:     { label: 'Manhwa',     color: '#ec4899' },
}

const GLASS = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 3,
}

const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] } }
const save = list => localStorage.setItem(STORAGE_KEY, JSON.stringify(list))

async function searchAniList(query) {
  const gql = `query($search:String){Page(perPage:8){media(search:$search,type:ANIME,sort:POPULARITY_DESC){id title{romaji english}coverImage{medium}episodes averageScore format status}}}`
  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gql, variables: { search: query } })
  })
  const { data } = await res.json()
  return data?.Page?.media || []
}

async function importAniListUser(username) {
  const gql = `query($name:String){User(name:$name){mediaListOptions{scoreFormat}}MediaListCollection(userName:$name,type:ANIME){lists{name entries{status score(format:POINT_100) media{id title{romaji english}coverImage{medium}episodes format}}}}}`
  const res = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gql, variables: { name: username } })
  })
  const { data } = await res.json()
  return data?.MediaListCollection?.lists?.flatMap(l => l.entries) || []
}

export default function Tracker() {
  const [list, setList] = useState(load)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [username, setUsername] = useState('')
  const [importing, setImporting] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [importMsg, setImportMsg] = useState('')

  const updateList = l => { setList(l); save(l) }

  const doSearch = async () => {
    if (!search.trim()) return
    setSearching(true); setResults([])
    try { setResults(await searchAniList(search.trim())) } catch { setResults([]) }
    setSearching(false)
  }

  const addToList = (media, status = 'PLANNING') => {
    if (list.find(x => x.id === media.id)) return
    updateList([{ id: media.id, title: media.title.romaji || media.title.english, cover: media.coverImage?.medium, episodes: media.episodes, score: 0, status, format: media.format, added: Date.now() }, ...list])
  }

  const changeStatus = (id, status) => updateList(list.map(x => x.id === id ? { ...x, status } : x))
  const remove = id => updateList(list.filter(x => x.id !== id))
  const setScore = (id, score) => updateList(list.map(x => x.id === id ? { ...x, score } : x))

  const doImport = async () => {
    if (!username.trim()) return
    setImporting(true); setImportMsg('')
    try {
      const entries = await importAniListUser(username.trim())
      const mapped = entries.map(e => ({
        id: e.media.id,
        title: e.media.title.romaji || e.media.title.english,
        cover: e.media.coverImage?.medium,
        episodes: e.media.episodes,
        score: e.score || 0,
        status: e.status || 'COMPLETED',
        format: e.media.format,
        added: Date.now(),
      }))
      const merged = [...list]
      let added = 0
      mapped.forEach(m => { if (!merged.find(x => x.id === m.id)) { merged.push(m); added++ } })
      updateList(merged)
      setImportMsg(`Imported ${added} new entries (${mapped.length} total from AniList)`)
    } catch (e) { setImportMsg('Import failed — check username or network') }
    setImporting(false)
  }

  const filtered = filter === 'ALL' ? list : list.filter(x => x.status === filter)
  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, list.filter(x => x.status === k).length]))

  return (
    <Box>
      {/* Import bar */}
      <Paper sx={{ ...GLASS, p: 2, mb: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 1 }}>
          AUTO-SYNC · Import from AniList
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField size="small" label="AniList Username" value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doImport()} sx={{ flex: 1 }}
            InputProps={{ sx: { background: 'rgba(255,255,255,0.04)' } }} />
          <Button variant="outlined" startIcon={<Sync />} onClick={doImport} disabled={importing}
            sx={{ borderColor: 'rgba(167,139,250,0.4)', color: '#a78bfa', '&:hover': { borderColor: '#a78bfa', background: 'rgba(167,139,250,0.08)' } }}>
            {importing ? 'Syncing…' : 'Import All'}
          </Button>
        </Box>
        {importing && <LinearProgress sx={{ mt: 1, borderRadius: 1, background: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { background: '#7c3aed' } }} />}
        {importMsg && <Typography variant="caption" sx={{ color: importMsg.includes('fail') ? '#f87171' : '#34d399', mt: 0.5, display: 'block' }}>{importMsg}</Typography>}
      </Paper>

      {/* Search */}
      <Paper sx={{ ...GLASS, p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" label="Search AniList…" value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()} fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 18 }} /></InputAdornment>, sx: { background: 'rgba(255,255,255,0.04)' } }} />
          <Button variant="contained" onClick={doSearch} disabled={searching}
            sx={{ background: 'rgba(124,58,237,0.7)', '&:hover': { background: 'rgba(124,58,237,0.9)' }, backdropFilter: 'blur(8px)' }}>
            {searching ? '…' : 'Search'}
          </Button>
        </Box>
        {searching && <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>{Array(4).fill(0).map((_,i)=><Skeleton key={i} variant="rounded" width={120} height={160} sx={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2 }} />)}</Box>}
        {results.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
            {results.map(m => (
              <Box key={m.id} sx={{ width: 120, cursor: 'pointer', '&:hover .add-btn': { opacity: 1 } }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar variant="rounded" src={m.coverImage?.medium} sx={{ width: 120, height: 160, mb: 0.5, borderRadius: 2 }} />
                  <Box className="add-btn" sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                    <IconButton onClick={() => addToList(m)} sx={{ color: '#a78bfa' }}><BookmarkAdd /></IconButton>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: 10, lineHeight: 1.3 }} noWrap>
                  {m.title.romaji || m.title.english}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>
                  {m.episodes ? `${m.episodes} eps` : m.format} · ⭐{((m.averageScore||0)/10).toFixed(1)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Stats + Filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip label={`All (${list.length})`} onClick={() => setFilter('ALL')} size="small"
          sx={{ background: filter === 'ALL' ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)', color: filter === 'ALL' ? '#a78bfa' : 'rgba(255,255,255,0.5)', borderColor: filter === 'ALL' ? 'rgba(167,139,250,0.4)' : 'transparent', border: '1px solid', cursor: 'pointer' }} />
        {Object.entries(STATUS_CONFIG).map(([k, cfg]) => counts[k] > 0 && (
          <Chip key={k} label={`${cfg.label} (${counts[k]})`} onClick={() => setFilter(k)} size="small"
            sx={{ background: filter === k ? `${cfg.color}22` : 'rgba(255,255,255,0.05)', color: filter === k ? cfg.color : 'rgba(255,255,255,0.4)', borderColor: filter === k ? `${cfg.color}55` : 'transparent', border: '1px solid', cursor: 'pointer' }} />
        ))}
      </Box>

      {/* List grid */}
      <Grid container spacing={1.5}>
        {filtered.map(item => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PLANNING
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Paper sx={{ ...GLASS, p: 1.5, display: 'flex', gap: 1.5, alignItems: 'flex-start', transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.07)' } }}>
                <Avatar variant="rounded" src={item.cover} sx={{ width: 48, height: 64, borderRadius: 1.5, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.3, mb: 0.5 }} noWrap title={item.title}>
                    {item.title}
                  </Typography>
                  <Chip label={cfg.label} size="small" sx={{ background: `${cfg.color}20`, color: cfg.color, height: 18, fontSize: 10, mb: 0.5 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <Star sx={{ fontSize: 12, color: '#fbbf24' }} />
                    <Select value={item.score || 0} onChange={e => setScore(item.id, e.target.value)} size="small" variant="standard" disableUnderline
                      sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.3)', fontSize: 14 } }}>
                      {[0,1,2,3,4,5,6,7,8,9,10].map(s => <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s === 0 ? '—' : `${s}/10`}</MenuItem>)}
                    </Select>
                    <Select value={item.status} onChange={e => changeStatus(item.id, e.target.value)} size="small" variant="standard" disableUnderline
                      sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.2)', fontSize: 14 }, flex: 1 }}>
                      {Object.entries(STATUS_CONFIG).map(([k, c]) => <MenuItem key={k} value={k} sx={{ fontSize: 12 }}>{c.label}</MenuItem>)}
                    </Select>
                    <IconButton size="small" onClick={() => remove(item.id)} sx={{ color: 'rgba(255,255,255,0.15)', '&:hover': { color: '#f87171' }, p: 0.25 }}>✕</IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'rgba(255,255,255,0.2)' }}>
          <Typography variant="body2">No entries yet. Search AniList or import your list above.</Typography>
        </Box>
      )}
    </Box>
  )
}
