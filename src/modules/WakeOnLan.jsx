import { useState } from 'react'
import { Wifi, Send, Plus, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const PRESETS = [
  { label: 'PC / Desktop', mac: '' },
  { label: 'NAS / Server', mac: '' },
]

function fmtMac(raw) {
  const clean = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 12)
  return clean.match(/.{1,2}/g)?.join(':') || clean
}

export default function WakeOnLan() {
  const [mac, setMac] = useState('')
  const [label, setLabel] = useState('')
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nextools_wol') || '[]') } catch { return [] }
  })
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})

  const saveMacs = (list) => { setSaved(list); localStorage.setItem('nextools_wol', JSON.stringify(list)) }

  const addDevice = () => {
    const clean = mac.replace(/[^0-9a-fA-F]/g, '')
    if (clean.length !== 12) return alert('Enter a valid 12-digit MAC address')
    const formatted = fmtMac(clean)
    saveMacs([...saved, { mac: formatted, label: label || formatted }])
    setMac(''); setLabel('')
  }

  const wake = async (id, macAddr) => {
    setLoading(prev => ({ ...prev, [id]: true }))
    const result = await window.electronAPI.sendWol(macAddr)
    setResults(prev => ({ ...prev, [id]: result.success ? 'sent' : 'error' }))
    setLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    setTimeout(() => setResults(prev => { const n = { ...prev }; delete n[id]; return n }), 4000)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Wake-on-LAN</h2>
      <p className="text-white/40 text-sm mb-8">Send a magic packet to wake sleeping computers on your local network.</p>

      {/* How to enable */}
      <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Wifi className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-white/40 text-sm">The target computer must have Wake-on-LAN enabled in its BIOS/UEFI and network adapter settings. Both devices must be on the same network.</p>
      </div>

      {/* Add device */}
      <div className="rounded-xl p-5 mb-6 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Add Device</p>
        <div className="flex gap-3">
          <input value={mac} onChange={e => setMac(fmtMac(e.target.value.replace(/[^0-9a-fA-F:]/g, '')))}
            placeholder="AA:BB:CC:DD:EE:FF"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white/70 font-mono outline-none"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional)"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white/60 outline-none"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <button onClick={addDevice}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.8),rgba(168,85,247,0.7))' }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Quick send without saving */}
        {mac.replace(/[^0-9a-fA-F]/g,'').length === 12 && (
          <button onClick={() => wake('quick', mac)}
            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            <Send className="w-3.5 h-3.5" /> Send magic packet now (without saving)
          </button>
        )}
      </div>

      {/* Saved devices */}
      <div className="space-y-2">
        {saved.length === 0 && (
          <div className="text-center py-10 text-white/20">
            <Wifi className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No devices added yet</p>
          </div>
        )}
        {saved.map((dev, i) => {
          const res = results[i]
          const isLoading = loading[i]
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 font-semibold text-sm">{dev.label}</p>
                <p className="text-white/30 text-xs font-mono">{dev.mac}</p>
              </div>
              {res === 'sent' && <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Sent!</span>}
              {res === 'error' && <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3.5 h-3.5" /> Failed</span>}
              <button onClick={() => wake(i, dev.mac)} disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'rgba(165,180,252,0.9)' }}>
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Wake
              </button>
              <button onClick={() => saveMacs(saved.filter((_,j) => j!==i))} className="text-white/20 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
