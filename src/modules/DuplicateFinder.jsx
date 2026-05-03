import { useState } from 'react'
import { Copy, Scan, Loader2, Trash2, AlertTriangle } from 'lucide-react'

export default function DuplicateFinder() {
  const [dir, setDir] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [groups, setGroups] = useState([]) // [{hash, size, files:[]}]
  const [deleting, setDeleting] = useState(new Set())
  const [deleted, setDeleted] = useState(new Set())

  const handleSelect = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) { setDir(folder); setGroups([]); setDeleted(new Set()) }
  }

  const handleScan = async () => {
    if (!dir) return
    setScanning(true); setGroups([])
    const result = await window.electronAPI.findDuplicates(dir)
    if (result.success) setGroups(result.groups)
    setScanning(false)
  }

  const handleDelete = async (filepath) => {
    setDeleting(prev => new Set([...prev, filepath]))
    const result = await window.electronAPI.deleteFile(filepath)
    if (result.success) setDeleted(prev => new Set([...prev, filepath]))
    setDeleting(prev => { const s = new Set(prev); s.delete(filepath); return s })
  }

  const totalDupes = groups.reduce((a, g) => a + g.files.length - 1, 0)
  const totalWasted = groups.reduce((a, g) => a + g.size * (g.files.length - 1), 0)

  const fmt = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Duplicate File Finder</h2>
      <p className="text-white/40 text-sm mb-8">Scan a folder for identical files using MD5 checksums, then safely delete copies.</p>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {dir ? <span className="text-white/60 font-mono">{dir}</span> : <span className="text-white/25">No folder selected</span>}
        </div>
        <button onClick={handleSelect} className="px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Browse
        </button>
        <button onClick={handleScan} disabled={!dir || scanning}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-40 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
          {scanning ? 'Scanning...' : 'Scan'}
        </button>
      </div>

      {/* Stats */}
      {groups.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Duplicate Groups', value: groups.length, color: 'text-yellow-400' },
            { label: 'Extra Copies', value: totalDupes, color: 'text-orange-400' },
            { label: 'Space Wasted', value: fmt(totalWasted), color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-white/30 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {groups.length === 0 && !scanning && dir && (
        <div className="text-center py-16 text-white/20">
          <Scan className="w-10 h-10 mx-auto mb-3" />
          <p>Click "Scan" to find duplicate files</p>
        </div>
      )}

      <div className="space-y-4">
        {groups.map((group, gi) => (
          <div key={gi} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-3">
                <Copy className="w-4 h-4 text-yellow-400" />
                <span className="text-white/60 text-sm font-medium">{group.files.length} identical files</span>
                <span className="text-white/25 text-xs">· {fmt(group.size)} each</span>
              </div>
              <span className="text-white/20 font-mono text-xs">{group.hash.slice(0, 8)}...</span>
            </div>
            {group.files.map((file, fi) => {
              const isDel = deleted.has(file)
              const isDeleting = deleting.has(file)
              const isOriginal = fi === 0
              return (
                <div key={fi} className={`flex items-center justify-between px-5 py-3 border-t transition-all ${isDel ? 'opacity-40' : ''}`}
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isOriginal
                      ? <span className="text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-0.5 rounded flex-shrink-0">KEEP</span>
                      : <span className="text-red-400 text-xs font-semibold bg-red-400/10 px-2 py-0.5 rounded flex-shrink-0">COPY</span>
                    }
                    <span className="text-white/50 text-xs font-mono truncate">{file}</span>
                  </div>
                  {!isOriginal && !isDel && (
                    <button onClick={() => handleDelete(file)} disabled={isDeleting}
                      className="ml-4 flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Delete
                    </button>
                  )}
                  {isDel && <span className="text-white/20 text-xs flex-shrink-0">Deleted</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
