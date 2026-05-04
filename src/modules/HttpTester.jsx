import { useState } from 'react'

const METHODS = ['GET','POST','PUT','PATCH','DELETE']

export default function HttpTester() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [body, setBody] = useState('')
  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState(0)

  const send = async () => {
    if (!url.trim()) return
    setLoading(true); setRes(null)
    const start = Date.now()
    try {
      let hdrs = {}; try { hdrs = JSON.parse(headers) } catch {}
      const opts = { method, headers: hdrs }
      if (['POST','PUT','PATCH'].includes(method) && body.trim()) opts.body = body
      const r = await fetch(url, opts)
      const text = await r.text()
      setTime(Date.now() - start)
      let json = null; try { json = JSON.parse(text) } catch {}
      setRes({ status: r.status, statusText: r.statusText, headers: Object.fromEntries(r.headers.entries()), body: json ? JSON.stringify(json, null, 2) : text })
    } catch (e) {
      setTime(Date.now() - start)
      setRes({ status: 0, statusText: 'Error', body: e.message, headers: {} })
    }
    setLoading(false)
  }

  const statusColor = res ? (res.status >= 200 && res.status < 300 ? '#34d399' : res.status >= 400 ? '#f87171' : '#fbbf24') : '#6366f1'

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">HTTP Tester</h2>
      <p className="text-white/40 text-sm mb-6">Lightweight REST client</p>

      <div className="flex gap-2 mb-4">
        <select value={method} onChange={e => setMethod(e.target.value)}
          className="input-base !w-28 font-mono font-bold text-sm" style={{ cursor: 'pointer', color: '#818cf8' }}>
          {METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/data"
          className="input-base flex-1 font-mono text-sm" onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send} disabled={loading || !url.trim()} className="btn-primary px-6 py-2 text-sm">
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] text-white/30 block mb-1">Headers (JSON)</label>
          <textarea value={headers} onChange={e => setHeaders(e.target.value)}
            className="input-base font-mono text-xs" rows={4} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className="text-[10px] text-white/30 block mb-1">Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            className="input-base font-mono text-xs" rows={4} style={{ resize: 'vertical' }}
            placeholder='{"key": "value"}' />
        </div>
      </div>

      {res && (
        <div className="glass-card p-4" style={{ borderLeft: `2px solid ${statusColor}` }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-lg font-bold" style={{ color: statusColor }}>{res.status}</span>
            <span className="text-white/40 text-sm">{res.statusText}</span>
            <span className="text-white/20 text-xs ml-auto">{time}ms</span>
          </div>
          <pre className="font-mono text-xs text-white/60 whitespace-pre-wrap overflow-auto max-h-64 p-3 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            {res.body}
          </pre>
        </div>
      )}
    </div>
  )
}
