import { useState } from 'react'
import { ShieldOff, AlertTriangle, Trash2, FolderOpen, Loader2, CheckCircle2 } from 'lucide-react'

export default function FileShredder() {
  const [files, setFiles] = useState([])
  const [passes, setPasses] = useState(3)
  const [shredding, setShredding] = useState(new Set())
  const [done, setDone] = useState(new Set())
  const [confirmed, setConfirmed] = useState(false)

  const handleAdd = async () => {
    const result = await window.electronAPI.selectFilesAny()
    if (result) setFiles(prev => [...new Set([...prev, ...result])])
  }

  const shredOne = async (filepath) => {
    setShredding(prev => new Set([...prev, filepath]))
    const result = await window.electronAPI.shredFile(filepath, passes)
    if (result.success) setDone(prev => new Set([...prev, filepath]))
    setShredding(prev => { const s = new Set(prev); s.delete(filepath); return s })
  }

  const shredAll = async () => {
    for (const f of files.filter(f => !done.has(f))) await shredOne(f)
  }

  const pending = files.filter(f => !done.has(f))

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">File Shredder</h2>
      <p className="text-white/40 text-sm mb-6">Permanently destroy files by overwriting with random bytes before deletion. Cannot be recovered.</p>

      {/* Warning banner */}
      <div className="rounded-xl p-4 flex gap-3 mb-6" style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)' }}>
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-400 font-semibold text-sm">Irreversible Action</p>
          <p className="text-white/40 text-sm mt-0.5">Shredded files <strong>cannot be recovered</strong>. The data is overwritten {passes}× with random bytes before deletion.</p>
        </div>
      </div>

      {/* Passes */}
      <div className="rounded-xl p-5 mb-6 flex items-center gap-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex-1">
          <p className="text-white/60 text-sm font-semibold mb-1">Overwrite Passes: {passes}</p>
          <input type="range" min="1" max="7" value={passes} onChange={e => setPasses(Number(e.target.value))} className="w-full accent-red-500" />
          <div className="flex justify-between text-xs text-white/20 mt-1">
            <span>1 (Fast)</span><span>3 (Recommended)</span><span>7 (DoD)</span>
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="space-y-3 mb-6">
        {files.map((f, i) => {
          const isDone = done.has(f)
          const isShredding = shredding.has(f)
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all"
              style={{ background: isDone ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isDone ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
                opacity: isDone ? 0.6 : 1 }}>
              {isDone ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                : <ShieldOff className="w-4 h-4 text-white/25 flex-shrink-0" />}
              <span className="flex-1 text-white/60 text-sm font-mono truncate">{f.split('\\').pop()}</span>
              {isDone ? <span className="text-green-400 text-xs">Shredded</span>
                : <button onClick={() => shredOne(f)} disabled={isShredding}
                    className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40">
                    {isShredding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {isShredding ? 'Shredding…' : 'Shred'}
                  </button>
              }
              {!isDone && <button onClick={() => setFiles(p => p.filter(x => x !== f))} className="text-white/20 hover:text-white/50 text-xs ml-1">✕</button>}
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={handleAdd} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
          <FolderOpen className="w-4 h-4" /> Add Files
        </button>
        {pending.length > 0 && (
          <button onClick={shredAll} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.3)', color:'rgba(248,113,113,0.9)' }}>
            <Trash2 className="w-4 h-4" /> Shred All ({pending.length})
          </button>
        )}
      </div>
    </div>
  )
}
