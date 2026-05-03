import { useState, useRef } from 'react'
import { StickyNote, Plus, Trash2, Save, Edit3, Search, FileText } from 'lucide-react'

const COLORS = [
  { name: 'slate', bg: 'rgba(51,65,85,0.4)', border: 'rgba(100,116,139,0.3)', accent: '#94a3b8' },
  { name: 'indigo', bg: 'rgba(49,46,129,0.3)', border: 'rgba(99,102,241,0.3)', accent: '#818cf8' },
  { name: 'purple', bg: 'rgba(59,7,100,0.3)', border: 'rgba(168,85,247,0.3)', accent: '#c084fc' },
  { name: 'rose', bg: 'rgba(136,19,55,0.3)', border: 'rgba(244,63,94,0.3)', accent: '#fb7185' },
  { name: 'amber', bg: 'rgba(120,53,15,0.3)', border: 'rgba(245,158,11,0.3)', accent: '#fbbf24' },
  { name: 'teal', bg: 'rgba(19,78,74,0.3)', border: 'rgba(20,184,166,0.3)', accent: '#2dd4bf' },
]

function timeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function QuickNotes() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nextools_notes') || '[]') } catch { return [] }
  })
  const [activeId, setActiveId] = useState(null)
  const [search, setSearch] = useState('')
  const saveRef = useRef()

  const save = (updated) => {
    setNotes(updated)
    localStorage.setItem('nextools_notes', JSON.stringify(updated))
  }

  const addNote = () => {
    const id = Date.now()
    const note = { id, title: 'New Note', content: '', color: 'slate', created: id, updated: id }
    const updated = [note, ...notes]
    save(updated)
    setActiveId(id)
  }

  const updateNote = (id, fields) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...fields, updated: Date.now() } : n)
    save(updated)
  }

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id)
    save(updated)
    if (activeId === id) setActiveId(updated[0]?.id || null)
  }

  const active = notes.find(n => n.id === activeId)
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Quick Notes</h2>
      <p className="text-white/40 text-sm mb-6">Persistent scratchpad. Notes are saved automatically to local storage.</p>

      <div className="flex gap-5 h-[600px]">
        {/* Sidebar */}
        <div className="w-56 flex flex-col gap-3 flex-shrink-0">
          <button onClick={addNote}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}>
            <Plus className="w-4 h-4" /> New Note
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full rounded-lg pl-8 pr-3 py-2 text-xs text-white/60 outline-none"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {filtered.map(note => {
              const col = COLORS.find(c => c.name === note.color) || COLORS[0]
              return (
                <div key={note.id}
                  onClick={() => setActiveId(note.id)}
                  className="rounded-xl p-3 cursor-pointer group relative transition-all"
                  style={{
                    background: activeId === note.id ? col.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeId === note.id ? col.border : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  <p className="text-white/70 text-xs font-semibold truncate mb-1">{note.title || 'Untitled'}</p>
                  <p className="text-white/30 text-xs truncate leading-relaxed">{note.content.slice(0, 60) || 'Empty note'}</p>
                  <p className="text-white/20 text-xs mt-1.5">{timeAgo(note.updated)}</p>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                    className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                  ><Trash2 className="w-3 h-3" /></button>
                </div>
              )
            })}
            {notes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/20 text-xs">No notes yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {active ? (
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              {/* Note header */}
              <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
                <input
                  value={active.title}
                  onChange={e => updateNote(active.id, { title: e.target.value })}
                  className="flex-1 bg-transparent text-white/80 font-semibold text-sm outline-none"
                  placeholder="Note title..."
                />
                {/* Color picker */}
                <div className="flex gap-1.5">
                  {COLORS.map(col => (
                    <button key={col.name} onClick={() => updateNote(active.id, { color: col.name })}
                      className="w-4 h-4 rounded-full transition-transform hover:scale-125"
                      style={{ background: col.accent, outline: active.color === col.name ? `2px solid ${col.accent}` : 'none', outlineOffset: '1px' }} />
                  ))}
                </div>
                <span className="text-white/20 text-xs">{timeAgo(active.updated)}</span>
              </div>

              {/* Content */}
              <textarea
                value={active.content}
                onChange={e => updateNote(active.id, { content: e.target.value })}
                placeholder="Start typing your note..."
                className="flex-1 resize-none p-5 text-sm text-white/60 bg-transparent outline-none leading-relaxed font-mono placeholder:text-white/15"
              />

              {/* Stats */}
              <div className="px-5 py-2 text-xs text-white/20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {active.content.length} chars · {active.content.trim() ? active.content.trim().split(/\s+/).length : 0} words · {active.content.split('\n').length} lines
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <StickyNote className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-white/25 text-sm">Select a note or create a new one</p>
              <button onClick={addNote} className="mt-4 text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
                + Create your first note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
