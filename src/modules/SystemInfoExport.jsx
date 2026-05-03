import { useState } from 'react'
import { FileDown, Loader2, Monitor, Cpu, HardDrive, Wifi, CheckCircle2 } from 'lucide-react'

export default function SystemInfoExport() {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [exported, setExported] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    const result = await window.electronAPI.getFullSystemReport()
    if (result.success) setPreview(result.report)
    setLoading(false)
  }

  const handleExport = async () => {
    if (!preview) return
    setLoading(true)
    const result = await window.electronAPI.saveSystemReport(preview)
    if (result.success) setExported(result.path)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">System Info Export</h2>
      <p className="text-white/40 text-sm mb-8">Generate a complete hardware and software report and export it as a text file.</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: Cpu, label: 'CPU', desc: 'Model, cores, speed, load' },
          { icon: Monitor, label: 'Memory', desc: 'Total, used, free' },
          { icon: HardDrive, label: 'Storage', desc: 'All drives, usage' },
          { icon: Wifi, label: 'Network', desc: 'Interfaces, MAC, IP' },
        ].map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-white/60 text-sm font-semibold">{item.label}</p>
              <p className="text-white/25 text-xs mt-1">{item.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={handleGenerate} disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Monitor className="w-4 h-4" />}
          {loading ? 'Gathering Info...' : 'Generate Report'}
        </button>

        {preview && (
          <button onClick={handleExport} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: 'rgba(52,211,153,1)' }}>
            <FileDown className="w-4 h-4" />
            Save as .txt
          </button>
        )}
      </div>

      {exported && (
        <div className="flex items-center gap-3 rounded-xl p-4 mb-4" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 text-sm font-semibold">Saved Successfully</p>
            <p className="text-white/30 text-xs font-mono">{exported}</p>
          </div>
        </div>
      )}

      {preview && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-2.5 flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Report Preview</p>
            <p className="text-xs text-white/20">{preview.split('\n').length} lines</p>
          </div>
          <pre className="px-5 py-4 text-xs text-white/50 font-mono leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
            {preview}
          </pre>
        </div>
      )}

      {!preview && !loading && (
        <div className="rounded-xl p-16 text-center" style={{ border: '2px dashed rgba(255,255,255,0.08)' }}>
          <FileDown className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-white/25 text-sm">Click "Generate Report" to collect system information</p>
          <p className="text-white/15 text-xs mt-1">Takes about 3–5 seconds to gather all data</p>
        </div>
      )}
    </div>
  )
}
