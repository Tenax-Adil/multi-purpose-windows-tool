import { useState } from 'react'
import { Upload, Loader2, ImageIcon, RefreshCw } from 'lucide-react'

const PRESETS = [
  { label: 'HD (1280×720)', w: 1280, h: 720 },
  { label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
  { label: 'Square (1080×1080)', w: 1080, h: 1080 },
  { label: 'Thumbnail (320×180)', w: 320, h: 180 },
  { label: 'Icon (64×64)', w: 64, h: 64 },
  { label: 'Avatar (256×256)', w: 256, h: 256 },
  { label: 'Custom', w: 0, h: 0 },
]

export default function BatchResizer() {
  const [files, setFiles] = useState([])
  const [preset, setPreset] = useState(0)
  const [customW, setCustomW] = useState('')
  const [customH, setCustomH] = useState('')
  const [keepAspect, setKeepAspect] = useState(true)
  const [outputFormat, setOutputFormat] = useState('same')
  const [outputDir, setOutputDir] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(false)

  const activePreset = PRESETS[preset]
  const finalW = preset === 6 ? (customW || 0) : activePreset.w
  const finalH = preset === 6 ? (customH || 0) : activePreset.h

  const handleAddFiles = async () => {
    const result = await window.electronAPI.selectFiles(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'])
    if (result) setFiles(prev => [...new Set([...prev, ...result])])
  }

  const handleSelectOutput = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setOutputDir(folder)
  }

  const handleRun = async () => {
    if (!files.length || (!finalW && !finalH)) return
    setRunning(true)
    setLogs([])
    setProgress({ current: 0, total: files.length })

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const ext = f.split('.').pop().toLowerCase()
      const fmt = outputFormat === 'same' ? (ext === 'jpg' ? 'jpeg' : ext) : outputFormat
      const result = await window.electronAPI.convertImage({
        input: f,
        format: fmt,
        quality: 92,
        outputDir: outputDir || null,
        resize: {
          width: finalW ? String(finalW) : '',
          height: finalH ? String(finalH) : ''
        }
      })
      if (result.success) setLogs(prev => [...prev, `✓ ${f.split('\\').pop()} → ${result.output.split('\\').pop()}`])
      else setLogs(prev => [...prev, `✗ ${f.split('\\').pop()}: ${result.error}`])
      setProgress({ current: i + 1, total: files.length })
    }
    setRunning(false)
  }

  const pct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Batch Image Resizer</h2>
      <p className="text-white/40 text-sm mb-8">Resize hundreds of images to exact dimensions in one go.</p>

      <div className="grid grid-cols-5 gap-6">
        {/* Options */}
        <div className="col-span-2 space-y-5">
          <OptionBlock title="Size Preset">
            <div className="space-y-1.5">
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => setPreset(i)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: preset === i ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${preset === i ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: preset === i ? 'rgba(165,180,252,1)' : 'rgba(255,255,255,0.4)'
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </OptionBlock>

          {preset === 6 && (
            <OptionBlock title="Custom Size">
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="W" value={customW} onChange={e => setCustomW(e.target.value)}
                  className="w-20 rounded-lg px-2 py-1.5 text-sm text-white/70 text-center outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <span className="text-white/20">×</span>
                <input type="number" placeholder="H" value={customH} onChange={e => setCustomH(e.target.value)}
                  className="w-20 rounded-lg px-2 py-1.5 text-sm text-white/70 text-center outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <span className="text-white/30 text-xs">px</span>
              </div>
              <p className="text-white/20 text-xs mt-1">Set 0 for auto (keep aspect ratio on that axis)</p>
            </OptionBlock>
          )}

          <OptionBlock title="Output Format">
            <div className="flex flex-wrap gap-2">
              {['same', 'jpeg', 'png', 'webp'].map(f => (
                <button key={f} onClick={() => setOutputFormat(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                  style={{
                    background: outputFormat === f ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${outputFormat === f ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    color: outputFormat === f ? 'rgba(165,180,252,1)' : 'rgba(255,255,255,0.3)'
                  }}>
                  {f === 'same' ? 'Same' : f}
                </button>
              ))}
            </div>
          </OptionBlock>

          <OptionBlock title="Output Folder">
            <button onClick={handleSelectOutput} className="w-full text-sm text-left rounded-lg px-3 py-2.5"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {outputDir
                ? <span className="text-white/60 font-mono text-xs truncate block">{outputDir}</span>
                : <span className="text-white/25">Same as input (default)</span>}
            </button>
          </OptionBlock>

          <button onClick={handleRun} disabled={files.length === 0 || running || (!finalW && !finalH)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}>
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {running ? 'Resizing...' : `Resize ${files.length} Image${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* File list */}
        <div className="col-span-3 space-y-4">
          <div
            onClick={handleAddFiles}
            className="rounded-xl p-8 text-center cursor-pointer transition-all"
            style={{ border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Click to add images</p>
          </div>

          {files.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <p className="text-xs text-white/30">{files.length} images</p>
                <button onClick={() => setFiles([])} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Clear</button>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-xs text-white/50 font-mono truncate">{f.split('\\').pop()}</span>
                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 text-xs ml-3 flex-shrink-0">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {running && (
            <div>
              <div className="flex justify-between text-xs text-white/30 mb-1.5">
                <span>Processing...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, rgba(99,102,241,0.8), rgba(168,85,247,0.8))' }} />
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="rounded-xl p-4 font-mono text-xs space-y-1 max-h-52 overflow-y-auto"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {logs.map((l, i) => (
                <div key={i} className={l.startsWith('✓') ? 'text-green-400' : 'text-red-400'}>{l}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OptionBlock({ title, children }) {
  return (
    <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">{title}</p>
      {children}
    </div>
  )
}
