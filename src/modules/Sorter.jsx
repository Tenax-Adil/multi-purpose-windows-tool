import { useState, useCallback, useRef } from 'react'
import { FolderGit2, Play, FileTerminal, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'

function EmptyDrop({ onSelect, icon: Icon, title, desc }) {
  return (
    <div
      onClick={onSelect}
      className="rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300"
      style={{ border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ background: 'rgba(99,102,241,0.15)' }}>
        <Icon className="w-7 h-7 text-indigo-400" />
      </div>
      <h3 className="text-white/80 font-semibold mb-1">{title}</h3>
      <p className="text-white/30 text-sm max-w-xs">{desc}</p>
    </div>
  )
}

function LogPanel({ logs, color = 'text-green-400' }) {
  return (
    <div className="rounded-xl p-4 font-mono text-xs space-y-1 max-h-52 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {logs.map((log, i) => (
        <div key={i} className="flex gap-2">
          <span className={color}>›</span>
          <span className="text-white/50">{log}</span>
        </div>
      ))}
    </div>
  )
}

export default function Sorter() {
  const [dir, setDir] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [watching, setWatching] = useState(false)
  const [done, setDone] = useState(false)

  const handleSelect = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) { setDir(folder); setLogs([]); setDone(false) }
  }

  const handleSort = async () => {
    if (!dir) return
    setLoading(true); setDone(false)
    const result = await window.electronAPI.sortFolder(dir)
    if (result.success) {
      setLogs(result.logs.length ? result.logs : ['Nothing to sort — folder is already clean!'])
      setDone(true)
    } else {
      setLogs([`Error: ${result.error}`])
    }
    setLoading(false)
  }

  const handleWatch = async () => {
    if (!dir) return
    if (watching) {
      await window.electronAPI.stopWatcher()
      setWatching(false)
      setLogs(prev => [...prev, '— Watcher stopped —'])
    } else {
      await window.electronAPI.startWatcher(dir)
      setWatching(true)
      setLogs(prev => [...prev, `— Auto-watcher started on ${dir} —`])
    }
  }

  const categories = [
    { name: 'Images', exts: 'jpg, jpeg, png, gif, webp, avif, tiff, svg', color: 'bg-blue-500' },
    { name: 'Documents', exts: 'pdf, doc, docx, txt, xlsx, pptx, csv', color: 'bg-green-500' },
    { name: 'Archives', exts: 'zip, rar, 7z, tar, gz', color: 'bg-yellow-500' },
    { name: 'Executables', exts: 'exe, msi, apk, dmg', color: 'bg-red-500' },
    { name: 'Videos', exts: 'mp4, mkv, avi, mov, wmv', color: 'bg-purple-500' },
    { name: 'Audio', exts: 'mp3, wav, flac, aac, ogg', color: 'bg-pink-500' },
    { name: 'Others', exts: 'Everything else', color: 'bg-slate-500' },
  ]

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Smart Folder Sorter</h2>
      <p className="text-white/40 text-sm mb-8">Automatically categorize files by type. One-shot or always-on watcher mode.</p>

      {!dir ? (
        <EmptyDrop onSelect={handleSelect} icon={FolderGit2} title="Select Target Directory" desc="Click to choose a folder. We'll sort its files into categorized sub-folders automatically." />
      ) : (
        <div className="space-y-6">
          {/* Directory card */}
          <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-xs text-white/30 mb-1 uppercase tracking-wider">Target Directory</p>
              <p className="text-white/80 font-mono text-sm">{dir}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSelect} className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
                Change
              </button>
              <button onClick={handleWatch}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${watching ? 'text-yellow-300' : 'text-white/70 hover:text-white'}`}
                style={{ background: watching ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.05)', border: watching ? '1px solid rgba(234,179,8,0.3)' : '1px solid transparent' }}
              >
                <Eye className="w-4 h-4" />
                {watching ? 'Stop Watcher' : 'Auto Watch'}
              </button>
              <button onClick={handleSort} disabled={loading}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : done ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {loading ? 'Sorting...' : 'Sort Now'}
              </button>
            </div>
          </div>

          {/* Category legend */}
          <div className="grid grid-cols-4 gap-3">
            {categories.map(cat => (
              <div key={cat.name} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <span className="text-white/70 text-xs font-semibold">{cat.name}</span>
                </div>
                <p className="text-white/25 text-xs leading-relaxed">{cat.exts}</p>
              </div>
            ))}
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileTerminal className="w-4 h-4 text-white/30" />
                <p className="text-xs text-white/30 uppercase tracking-wider">Activity Log</p>
              </div>
              <LogPanel logs={logs} color="text-green-400" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
