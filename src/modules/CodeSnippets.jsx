import { useState, useEffect } from 'react'

const KEY = 'nex_snippets'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export default function CodeSnippets() {
  const [snippets, setSnippets] = useState(load)
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [tag, setTag] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  const save = list => { setSnippets(list); localStorage.setItem(KEY, JSON.stringify(list)) }

  const add = () => {
    if (!title.trim() || !code.trim()) return
    const item = { id: Date.now(), title, code, tag: tag.trim(), created: new Date().toLocaleDateString() }
    if (editing) { save(snippets.map(s => s.id === editing ? { ...s, title, code, tag: tag.trim() } : s)); setEditing(null) }
    else save([item, ...snippets])
    setTitle(''); setCode(''); setTag('')
  }

  const edit = s => { setTitle(s.title); setCode(s.code); setTag(s.tag || ''); setEditing(s.id) }
  const del = id => save(snippets.filter(s => s.id !== id))

  const filtered = snippets.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    (s.tag || '').toLowerCase().includes(search.toLowerCase())
  )

  const tags = [...new Set(snippets.map(s => s.tag).filter(Boolean))]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Code Snippets</h2>
      <p className="text-white/40 text-sm mb-6">Save and organize code snippets</p>

      <div className="glass-card p-4 mb-4">
        <div className="flex gap-2 mb-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Snippet title…"
            className="input-base flex-1 text-sm" />
          <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag"
            className="input-base !w-32 text-sm" />
        </div>
        <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste your code here…"
          className="input-base font-mono text-xs mb-2" rows={5} style={{ resize: 'vertical' }} />
        <div className="flex gap-2">
          <button onClick={add} className="btn-primary px-4 py-2 text-xs">{editing ? 'Update' : 'Save Snippet'}</button>
          {editing && <button onClick={() => { setEditing(null); setTitle(''); setCode(''); setTag('') }} className="btn-ghost px-4 py-2 text-xs">Cancel</button>}
        </div>
      </div>

      <div className="flex gap-2 mb-4 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search snippets…"
          className="input-base flex-1 text-sm" />
        <span className="text-xs text-white/20">{filtered.length} snippets</span>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {tags.map(t => (
            <button key={t} onClick={() => setSearch(t)} className="tag text-[10px] cursor-pointer hover:opacity-80">{t}</button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(s => (
          <div key={s.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm font-semibold">{s.title}</span>
                {s.tag && <span className="tag text-[10px]">{s.tag}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(s.code)} className="text-[10px] text-indigo-400 hover:text-indigo-300">Copy</button>
                <button onClick={() => edit(s)} className="text-[10px] text-white/30 hover:text-white/60">Edit</button>
                <button onClick={() => del(s.id)} className="text-[10px] text-red-400/50 hover:text-red-400">Delete</button>
              </div>
            </div>
            <pre className="font-mono text-xs text-white/50 whitespace-pre-wrap overflow-auto max-h-32 p-2.5 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.3)' }}>{s.code}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
