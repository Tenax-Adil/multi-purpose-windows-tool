import { useState } from 'react'

function b64decode(str) {
  try { return JSON.parse(atob(str.replace(/-/g,'+').replace(/_/g,'/'))) }
  catch { return null }
}

export default function JwtDecoder() {
  const [jwt, setJwt] = useState('')
  const parts = jwt.trim().split('.')
  const header = parts[0] ? b64decode(parts[0]) : null
  const payload = parts[1] ? b64decode(parts[1]) : null
  const sig = parts[2] || ''
  const valid = parts.length === 3 && header && payload

  const expiry = payload?.exp ? new Date(payload.exp * 1000) : null
  const isExpired = expiry ? expiry < new Date() : false

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">JWT Decoder</h2>
      <p className="text-white/40 text-sm mb-6">Decode and inspect JSON Web Tokens</p>
      <textarea value={jwt} onChange={e => setJwt(e.target.value)} rows={4}
        placeholder="Paste a JWT token here…"
        className="input-base font-mono text-xs mb-4" style={{ resize: 'vertical' }} />

      {valid ? (
        <div className="space-y-3">
          <Section title="Header" color="#3b82f6" data={header} />
          <Section title="Payload" color="#a855f7" data={payload} />
          {expiry && (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-white/40">Expires:</span>
              <span className={`text-xs font-mono ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                {expiry.toLocaleString()} {isExpired ? '(EXPIRED)' : '(valid)'}
              </span>
            </div>
          )}
          <div className="glass-card p-4">
            <span className="text-xs text-white/30 block mb-2">Signature</span>
            <p className="font-mono text-[11px] text-white/40 break-all">{sig}</p>
          </div>
        </div>
      ) : jwt.trim() && (
        <div className="glass-card p-4 text-center">
          <p className="text-red-400/60 text-sm">Invalid JWT format — needs 3 dot-separated parts</p>
        </div>
      )}
    </div>
  )
}

function Section({ title, color, data }) {
  return (
    <div className="glass-card p-4" style={{ borderLeft: `2px solid ${color}` }}>
      <span className="text-xs font-semibold mb-2 block" style={{ color }}>{title}</span>
      <pre className="font-mono text-xs text-white/70 whitespace-pre-wrap overflow-auto max-h-48">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
