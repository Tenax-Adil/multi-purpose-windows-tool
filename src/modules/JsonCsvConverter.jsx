import { useState } from 'react'
import { ArrowLeftRight, Copy, Check, Download, Upload } from 'lucide-react'

function jsonToCsv(json) {
  try {
    const data = JSON.parse(json)
    if (!Array.isArray(data)) return { error: 'Input must be a JSON array', result: '' }
    if (!data.length) return { error: 'Array is empty', result: '' }
    const keys = Object.keys(data[0])
    const header = keys.join(',')
    const rows = data.map(row => keys.map(k => {
      const val = row[k] == null ? '' : String(row[k])
      return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val
    }).join(','))
    return { error: null, result: [header, ...rows].join('\n') }
  } catch (e) { return { error: e.message, result: '' } }
}

function csvToJson(csv) {
  try {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return { error: 'Need at least a header and one data row', result: '' }
    const keys = lines[0].split(',').map(k => k.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return Object.fromEntries(keys.map((k, i) => [k, vals[i] ?? '']))
    })
    return { error: null, result: JSON.stringify(rows, null, 2) }
  } catch (e) { return { error: e.message, result: '' } }
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    window.electronAPI?.writeClipboard?.(text) || navigator.clipboard?.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function JsonCsvConverter() {
  const [mode, setMode] = useState('json2csv') // 'json2csv' | 'csv2json'
  const [input, setInput] = useState('')

  const result = mode === 'json2csv' ? jsonToCsv(input) : csvToJson(input)

  const handleSave = async () => {
    if (!result.result) return
    const ext = mode === 'json2csv' ? 'csv' : 'json'
    await window.electronAPI?.writeClipboard?.(result.result)
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">JSON ↔ CSV Converter</h2>
      <p className="text-white/40 text-sm mb-6">Instantly convert between JSON arrays and CSV tables.</p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {[{ id:'json2csv', label:'JSON → CSV' },{ id:'csv2json', label:'CSV → JSON' }].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setInput('') }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: mode===m.id?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
              border:`1px solid ${mode===m.id?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.08)'}`,
              color: mode===m.id?'rgba(165,180,252,1)':'rgba(255,255,255,0.4)' }}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">{mode==='json2csv'?'JSON Array Input':'CSV Input'}</p>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder={mode==='json2csv'
              ? '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
              : 'name,age\nAlice,30\nBob,25'}
            className="w-full rounded-xl p-4 text-sm text-white/60 font-mono resize-none outline-none leading-relaxed"
            style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', minHeight:320 }} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-white/30 uppercase tracking-wider">{mode==='json2csv'?'CSV Output':'JSON Output'}</p>
            {result.result && <CopyBtn text={result.result} />}
          </div>
          {result.error
            ? <div className="rounded-xl p-4" style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', minHeight:320 }}>
                <p className="text-red-400 text-sm font-mono">{result.error}</p>
              </div>
            : <div className="rounded-xl p-4 font-mono text-xs text-white/60 overflow-auto leading-relaxed"
                style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.08)', minHeight:320, maxHeight:320, whiteSpace:'pre-wrap' }}>
                {result.result || <span className="text-white/20">Output will appear here…</span>}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
