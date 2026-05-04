import { useState } from 'react'

const uuid4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
})
const nanoid = (len = 21) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  return Array.from({ length: len }, () => chars[Math.random() * chars.length | 0]).join('')
}
const hexStr = (len = 32) => Array.from({ length: len }, () => (Math.random() * 16 | 0).toString(16)).join('')

const GENS = [
  { id: 'uuid4', label: 'UUID v4', desc: 'Standard 128-bit UUID', fn: uuid4 },
  { id: 'nanoid', label: 'NanoID', desc: 'URL-safe 21 chars', fn: () => nanoid(21) },
  { id: 'nanoid8', label: 'NanoID-8', desc: 'Short 8 char ID', fn: () => nanoid(8) },
  { id: 'hex16', label: 'Hex-16', desc: '16 hex characters', fn: () => hexStr(16) },
  { id: 'hex32', label: 'Hex-32', desc: '32 hex characters', fn: () => hexStr(32) },
]

export default function UuidGenerator() {
  const [results, setResults] = useState({})
  const [batch, setBatch] = useState([])

  const generate = gen => {
    const val = gen.fn()
    setResults(r => ({ ...r, [gen.id]: val }))
  }

  const generateAll = () => { GENS.forEach(g => generate(g)) }

  const batchGen = (gen, count = 10) => {
    setBatch(Array.from({ length: count }, () => gen.fn()))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">UUID / ID Generator</h2>
      <p className="text-white/40 text-sm mb-6">Generate unique identifiers</p>

      <button onClick={generateAll} className="btn-primary px-5 py-2 text-sm mb-4">Generate All</button>

      <div className="space-y-2 mb-6">
        {GENS.map(gen => (
          <div key={gen.id} className="glass-card p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-white/60">{gen.label}</span>
                <span className="text-[10px] text-white/20">{gen.desc}</span>
              </div>
              <p className="font-mono text-sm text-white/80 truncate">{results[gen.id] || '—'}</p>
            </div>
            <button onClick={() => generate(gen)} className="btn-ghost px-3 py-1.5 text-xs">New</button>
            {results[gen.id] && <button onClick={() => navigator.clipboard.writeText(results[gen.id])}
              className="text-[10px] text-indigo-400 hover:text-indigo-300">Copy</button>}
            <button onClick={() => batchGen(gen)} className="text-[10px] text-white/25 hover:text-white/50">×10</button>
          </div>
        ))}
      </div>

      {batch.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40">Batch ({batch.length})</span>
            <button onClick={() => navigator.clipboard.writeText(batch.join('\n'))}
              className="text-[10px] text-indigo-400 hover:text-indigo-300">Copy All</button>
          </div>
          <pre className="font-mono text-xs text-white/50 whitespace-pre-wrap max-h-40 overflow-auto p-2 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            {batch.join('\n')}
          </pre>
        </div>
      )}
    </div>
  )
}
