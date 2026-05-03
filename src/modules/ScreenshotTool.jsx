import { useState } from 'react'
import { Camera, Loader2, FolderOpen, CheckCircle2, Monitor } from 'lucide-react'

export default function ScreenshotTool() {
  const [loading, setLoading] = useState(false)
  const [delay, setDelay] = useState(0)
  const [outputDir, setOutputDir] = useState(null)
  const [lastShot, setLastShot] = useState(null)

  const handleSelectDir = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setOutputDir(folder)
  }

  const handleCapture = async () => {
    setLoading(true)
    if (delay > 0) await new Promise(r => setTimeout(r, delay * 1000))
    const result = await window.electronAPI.takeScreenshot({ outputDir, delay: 0 })
    if (result.success) setLastShot(result.path)
    setLoading(false)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Screenshot Tool</h2>
      <p className="text-white/40 text-sm mb-8">Capture your full screen and save it as a PNG. Supports delayed capture.</p>

      <div className="grid grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Delay: {delay}s</p>
            <input type="range" min="0" max="10" step="1" value={delay} onChange={e => setDelay(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-white/20">
              {[0, 2, 5, 10].map(v => <span key={v}>{v}s</span>)}
            </div>
            {delay > 0 && <p className="text-white/30 text-xs">Screenshot will be taken {delay} seconds after clicking capture.</p>}
          </div>

          <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Save To</p>
            <button onClick={handleSelectDir} className="w-full text-sm text-left rounded-lg px-3 py-2.5 transition-colors"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {outputDir
                ? <span className="text-white/60 font-mono text-xs truncate block">{outputDir}</span>
                : <span className="text-white/25 flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Desktop (default)</span>
              }
            </button>
          </div>

          <button onClick={handleCapture} disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{delay > 0 ? `Waiting ${delay}s...` : 'Capturing...'}</>
              : <><Camera className="w-4 h-4" />Capture Screen</>
            }
          </button>
        </div>

        {/* Preview */}
        <div>
          {lastShot ? (
            <div className="rounded-xl overflow-hidden space-y-2" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <p className="text-xs text-green-400 font-semibold">Saved!</p>
              </div>
              <div className="p-3">
                <p className="text-white/30 text-xs font-mono truncate mb-3">{lastShot}</p>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img
                    src={`file://${lastShot}?t=${Date.now()}`}
                    alt="Screenshot"
                    className="w-full"
                    style={{ maxHeight: '280px', objectFit: 'contain', background: '#000' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl" style={{ border: '2px dashed rgba(255,255,255,0.08)', minHeight: '280px' }}>
              <div className="text-center">
                <Monitor className="w-10 h-10 text-white/15 mx-auto mb-3" />
                <p className="text-white/20 text-sm">Screenshot preview will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
