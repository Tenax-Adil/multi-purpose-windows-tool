import { useState } from 'react'
import { Network, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react'

const COMMON_PORTS = [
  { port: 21, name: 'FTP' }, { port: 22, name: 'SSH' }, { port: 23, name: 'Telnet' },
  { port: 25, name: 'SMTP' }, { port: 53, name: 'DNS' }, { port: 80, name: 'HTTP' },
  { port: 110, name: 'POP3' }, { port: 143, name: 'IMAP' }, { port: 443, name: 'HTTPS' },
  { port: 445, name: 'SMB' }, { port: 3306, name: 'MySQL' }, { port: 3389, name: 'RDP' },
  { port: 5432, name: 'PostgreSQL' }, { port: 6379, name: 'Redis' }, { port: 8080, name: 'HTTP-Alt' },
  { port: 8443, name: 'HTTPS-Alt' }, { port: 27017, name: 'MongoDB' }, { port: 5900, name: 'VNC' },
]

export default function PortScanner() {
  const [host, setHost] = useState('127.0.0.1')
  const [mode, setMode] = useState('common')
  const [customStart, setCustomStart] = useState('1')
  const [customEnd, setCustomEnd] = useState('1024')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  const scan = async () => {
    setScanning(true); setResults(null)
    const start = Date.now()
    let openPorts = []
    if (mode === 'common') {
      const ports = COMMON_PORTS.map(p => p.port)
      const result = await window.electronAPI.scanPorts({ host, ports })
      if (result.success) openPorts = result.openPorts
    } else {
      const result = await window.electronAPI.scanPortRange({ host, start: parseInt(customStart), end: parseInt(customEnd) })
      if (result.success) openPorts = result.openPorts
    }
    setElapsed(((Date.now() - start) / 1000).toFixed(1))
    setResults(openPorts)
    setScanning(false)
  }

  const getName = (port) => COMMON_PORTS.find(p => p.port === port)?.name || 'Unknown'

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Port Scanner</h2>
      <p className="text-white/40 text-sm mb-8">Check which ports are open on any host on your network.</p>

      <div className="rounded-xl p-5 space-y-4 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Target Host</p>
          <input value={host} onChange={e => setHost(e.target.value)} placeholder="IP address or hostname"
            className="w-full rounded-xl px-4 py-2.5 text-sm text-white/70 font-mono outline-none"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div className="flex gap-2 mt-2">
            {['127.0.0.1','192.168.1.1','192.168.0.1'].map(ip => (
              <button key={ip} onClick={() => setHost(ip)} className="text-xs text-indigo-400/70 hover:text-indigo-400 transition-colors">{ip}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Scan Mode</p>
          <div className="flex gap-2">
            {[{ id:'common', label:'Common Ports (18)' },{ id:'range', label:'Custom Range' }].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: mode===m.id?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
                  border:`1px solid ${mode===m.id?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.08)'}`,
                  color: mode===m.id?'rgba(165,180,252,1)':'rgba(255,255,255,0.4)' }}>{m.label}</button>
            ))}
          </div>
          {mode === 'range' && (
            <div className="flex gap-3 mt-3 items-center">
              <input type="number" value={customStart} onChange={e => setCustomStart(e.target.value)} placeholder="Start port"
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white/70 outline-none text-center"
                style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }} />
              <span className="text-white/30">–</span>
              <input type="number" value={customEnd} onChange={e => setCustomEnd(e.target.value)} placeholder="End port"
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white/70 outline-none text-center"
                style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }} />
            </div>
          )}
        </div>

        <button onClick={scan} disabled={scanning || !host}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.8),rgba(168,85,247,0.7))' }}>
          {scanning ? <><Loader2 className="w-4 h-4 animate-spin" />Scanning…</> : <><Search className="w-4 h-4" />Start Scan</>}
        </button>
      </div>

      {results !== null && (
        <div className="rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between px-5 py-3" style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white/70">{results.length} open port{results.length!==1?'s':''} on <span className="text-indigo-400 font-mono">{host}</span></p>
            <p className="text-xs text-white/25">Completed in {elapsed}s</p>
          </div>
          {results.length === 0
            ? <p className="text-center text-white/25 py-8 text-sm">No open ports found</p>
            : results.map(port => (
              <div key={port} className="flex items-center gap-4 px-5 py-3 border-t" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-indigo-300 font-mono font-bold text-sm w-12">{port}</span>
                <span className="text-white/50 text-sm">{getName(port)}</span>
                <div className="flex-1" />
                <span className="text-green-400/70 text-xs px-2 py-0.5 rounded" style={{ background:'rgba(52,211,153,0.1)' }}>OPEN</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
