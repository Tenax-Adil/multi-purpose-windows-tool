import { useState } from 'react'
import { Archive, FolderOpen, FilePlus, Package, Loader2, FolderPlus } from 'lucide-react'

export default function ArchiveManager() {
  const [mode, setMode] = useState('create') // 'create' | 'extract'
  const [files, setFiles] = useState([])
  const [archivePath, setArchivePath] = useState(null)
  const [outputDir, setOutputDir] = useState(null)
  const [archiveName, setArchiveName] = useState('archive')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])

  const handleAddFiles = async () => {
    const result = await window.electronAPI.selectFilesAny()
    if (result) setFiles(prev => [...new Set([...prev, ...result])])
  }

  const handleSelectArchive = async () => {
    const result = await window.electronAPI.selectFiles(['.zip'])
    if (result?.[0]) setArchivePath(result[0])
  }

  const handleSelectOutput = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setOutputDir(folder)
  }

  const handleCreate = async () => {
    if (files.length === 0) return
    setLoading(true); setLogs([])
    const result = await window.electronAPI.createArchive({ files, name: archiveName, outputDir })
    if (result.success) setLogs([`✓ Archive created: ${result.output}`])
    else setLogs([`✗ Error: ${result.error}`])
    setLoading(false)
  }

  const handleExtract = async () => {
    if (!archivePath) return
    setLoading(true); setLogs([])
    const result = await window.electronAPI.extractArchive({ archivePath, outputDir })
    if (result.success) setLogs([`✓ Extracted to: ${result.output}`, ...result.files.map(f => `  · ${f}`)])
    else setLogs([`✗ Error: ${result.error}`])
    setLoading(false)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Archive Manager</h2>
      <p className="text-white/40 text-sm mb-8">Create ZIP archives from files, or extract existing ones.</p>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { id: 'create', label: 'Create ZIP', icon: Package },
          { id: 'extract', label: 'Extract ZIP', icon: FolderPlus }
        ].map(m => {
          const Icon = m.icon
          return (
            <button key={m.id} onClick={() => { setMode(m.id); setLogs([]) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: mode === m.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${mode === m.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: mode === m.id ? 'rgba(165,180,252,1)' : 'rgba(255,255,255,0.4)'
              }}
            >
              <Icon className="w-4 h-4" />
              {m.label}
            </button>
          )
        })}
      </div>

      {mode === 'create' && (
        <div className="space-y-5">
          {/* Archive name */}
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Archive Name</label>
            <div className="flex items-center gap-2">
              <input value={archiveName} onChange={e => setArchiveName(e.target.value)}
                className="flex-1 rounded-xl px-4 py-3 text-white/80 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <span className="text-white/30 text-sm">.zip</span>
            </div>
          </div>

          {/* File list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-white/30 uppercase tracking-wider">Files to Include</label>
              <button onClick={handleAddFiles} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <FilePlus className="w-3.5 h-3.5" /> Add Files
              </button>
            </div>
            <div className="rounded-xl min-h-24 p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {files.length === 0
                ? <p className="text-white/20 text-sm text-center py-4">Click "Add Files" to select files</p>
                : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-white/50 text-xs font-mono truncate">{f.split('\\').pop()}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 text-xs ml-3 flex-shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Save Location</label>
            <button onClick={handleSelectOutput} className="w-full rounded-xl px-4 py-3 text-sm text-left transition-colors" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {outputDir ? <span className="text-white/60 font-mono text-xs">{outputDir}</span> : <span className="text-white/25">Same location as first file (default)</span>}
            </button>
          </div>

          <button onClick={handleCreate} disabled={files.length === 0 || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            {loading ? 'Creating...' : `Create ${archiveName}.zip`}
          </button>
        </div>
      )}

      {mode === 'extract' && (
        <div className="space-y-5">
          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">ZIP Archive</label>
            <button onClick={handleSelectArchive} className="w-full rounded-xl px-4 py-3 text-sm text-left" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {archivePath ? <span className="text-white/60 font-mono text-xs">{archivePath}</span> : <span className="text-white/25">Click to select a .zip file</span>}
            </button>
          </div>

          <div>
            <label className="text-xs text-white/30 uppercase tracking-wider block mb-2">Extract To</label>
            <button onClick={handleSelectOutput} className="w-full rounded-xl px-4 py-3 text-sm text-left" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {outputDir ? <span className="text-white/60 font-mono text-xs">{outputDir}</span> : <span className="text-white/25">Same folder as archive (default)</span>}
            </button>
          </div>

          <button onClick={handleExtract} disabled={!archivePath || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            {loading ? 'Extracting...' : 'Extract'}
          </button>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-6 rounded-xl p-4 font-mono text-xs space-y-1 max-h-48 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {logs.map((l, i) => (
            <div key={i} className={l.startsWith('✓') ? 'text-green-400' : l.startsWith('✗') ? 'text-red-400' : 'text-white/40'}>{l}</div>
          ))}
        </div>
      )}
    </div>
  )
}
