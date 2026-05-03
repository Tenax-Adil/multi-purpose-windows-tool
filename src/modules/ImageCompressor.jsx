import { useState } from 'react'
import { Image, Loader2, RefreshCw, Upload } from 'lucide-react'

function fmtSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB'
  return (bytes/1024/1024).toFixed(1) + ' MB'
}

export default function ImageCompressor() {
  const [files, setFiles] = useState([])
  const [targetQuality, setTargetQuality] = useState(72)
  const [outputDir, setOutputDir] = useState(null)
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const handleAdd = async () => {
    const r = await window.electronAPI.selectFiles(['.jpg','.jpeg','.png','.bmp','.tiff'])
    if (r) setFiles(prev => [...new Set([...prev, ...r])])
  }

  const handleSelectOutput = async () => {
    const f = await window.electronAPI.selectFolder()
    if (f) setOutputDir(f)
  }

  const handleCompress = async () => {
    if (!files.length) return
    setRunning(true); setResults([]); setProgress({ current: 0, total: files.length })
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const ext = f.split('.').pop().toLowerCase()
      const fmt = ['jpg','jpeg'].includes(ext) ? 'jpeg' : ext
      const originalSize = await window.electronAPI.getFileSize(f)
      const result = await window.electronAPI.convertImage({
        input: f, format: fmt, quality: targetQuality, outputDir: outputDir || null,
        resize: { width: '', height: '' }
      })
      const newSize = result.success ? await window.electronAPI.getFileSize(result.output) : 0
      setResults(prev => [...prev, {
        name: f.split('\\').pop(),
        original: originalSize,
        compressed: newSize,
        path: result.output,
        success: result.success,
        error: result.error
      }])
      setProgress({ current: i+1, total: files.length })
    }
    setRunning(false)
  }

  const totalSaved = results.reduce((a, r) => a + Math.max(0, (r.original || 0) - (r.compressed || 0)), 0)

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Image Compressor</h2>
      <p className="text-white/40 text-sm mb-6">Reduce image file sizes while maintaining visual quality.</p>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl p-5 space-y-3" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Quality: {targetQuality}%</p>
            <input type="range" min="10" max="95" value={targetQuality} onChange={e=>setTargetQuality(Number(e.target.value))} className="w-full accent-indigo-500" />
            <div className="flex justify-between text-xs text-white/25">
              <span>Smallest</span><span>Balanced</span><span>Best</span>
            </div>
            <div className="flex justify-center gap-2 pt-1">
              {[[40,'Aggressive'],[72,'Recommended'],[85,'Quality']].map(([q, label]) => (
                <button key={q} onClick={() => setTargetQuality(q)}
                  className="px-3 py-1 rounded-lg text-xs transition-all"
                  style={{ background: targetQuality===q?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.05)',
                    color: targetQuality===q?'#a5b4fc':'rgba(255,255,255,0.3)' }}>{label}</button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5 space-y-2" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Output Folder</p>
            <button onClick={handleSelectOutput} className="w-full text-sm text-left rounded-lg px-3 py-2.5"
              style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }}>
              {outputDir ? <span className="text-white/60 font-mono text-xs truncate block">{outputDir}</span>
                : <span className="text-white/25">Same as input (default)</span>}
            </button>
          </div>

          <button onClick={handleAdd} className="w-full py-3 rounded-xl text-sm font-medium text-white/60 transition-all flex items-center justify-center gap-2"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <Upload className="w-4 h-4" /> Add Images ({files.length})
          </button>
          <button onClick={handleCompress} disabled={!files.length || running}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.8),rgba(168,85,247,0.7))' }}>
            {running ? <><Loader2 className="w-4 h-4 animate-spin" />Compressing…</>
              : <><RefreshCw className="w-4 h-4" />Compress</>}
          </button>

          {results.length > 0 && (
            <div className="rounded-xl p-4 text-center" style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)' }}>
              <p className="text-green-400 text-xl font-bold">{fmtSize(totalSaved)}</p>
              <p className="text-white/40 text-xs">total space saved</p>
            </div>
          )}
        </div>

        <div className="col-span-3 space-y-2">
          {running && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/30 mb-1.5">
                <span>Compressing…</span><span>{progress.current}/{progress.total}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all" style={{ width:`${(progress.current/progress.total)*100}%`, background:'linear-gradient(90deg,rgba(99,102,241,0.8),rgba(168,85,247,0.8))' }} />
              </div>
            </div>
          )}

          {results.length > 0 ? results.map((r, i) => {
            const saved = (r.original || 0) - (r.compressed || 0)
            const pct = r.original ? Math.round((saved / r.original) * 100) : 0
            return (
              <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <Image className="w-4 h-4 text-white/25 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-sm truncate">{r.name}</p>
                  <p className="text-white/25 text-xs">{fmtSize(r.original)} → {fmtSize(r.compressed)}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${pct > 0 ? 'text-green-400' : 'text-white/30'}`}>
                  {pct > 0 ? `-${pct}%` : '~0%'}
                </span>
              </div>
            )
          }) : files.length > 0 ? (
            <div className="rounded-xl p-4" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
              {files.map((f,i) => (
                <div key={i} className="flex items-center justify-between py-2 border-t text-xs first:border-t-0" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                  <span className="text-white/40 font-mono truncate">{f.split('\\').pop()}</span>
                  <button onClick={() => setFiles(p => p.filter((_,j)=>j!==i))} className="text-white/20 hover:text-red-400 ml-3 flex-shrink-0">✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 rounded-xl" style={{ border:'2px dashed rgba(255,255,255,0.08)' }}>
              <div className="text-center">
                <Image className="w-10 h-10 text-white/10 mx-auto mb-2" />
                <p className="text-white/20 text-sm">Add images to compress</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
