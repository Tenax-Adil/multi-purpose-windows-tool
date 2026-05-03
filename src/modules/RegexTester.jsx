import { useState } from 'react'
import { Hash } from 'lucide-react'

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('gm')
  const [input, setInput] = useState('')
  const [replace, setReplace] = useState('')

  const getMatches = () => {
    if (!pattern || !input) return { matches: [], highlighted: input, error: null }
    try {
      const re = new RegExp(pattern, flags)
      const matches = [...input.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))]
      const highlighted = input.replace(re, m => `\x00${m}\x01`)
      return { matches, highlighted, error: null }
    } catch (e) {
      return { matches: [], highlighted: input, error: e.message }
    }
  }
  const getReplacedText = () => {
    if (!pattern || !input) return ''
    try { return input.replace(new RegExp(pattern, flags), replace) } catch { return '' }
  }

  const { matches, highlighted, error } = getMatches()

  const Highlighted = ({ text }) => {
    const parts = text.split(/(\x00[^\x01]*\x01)/g)
    return <>{parts.map((p, i) => p.startsWith('\x00')
      ? <mark key={i} style={{ background: 'rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: 3, padding: '1px 2px' }}>{p.slice(1, -1)}</mark>
      : <span key={i}>{p}</span>
    )}</>
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Regex Tester</h2>
      <p className="text-white/40 text-sm mb-6">Test regular expressions with live match highlighting.</p>

      <div className="space-y-4">
        {/* Pattern row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Pattern</p>
            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`, background: 'rgba(0,0,0,0.4)' }}>
              <span className="px-3 text-white/30 text-lg">/</span>
              <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="your regex here"
                className="flex-1 py-2.5 bg-transparent text-indigo-300 font-mono text-sm outline-none" />
              <span className="text-white/30 text-lg">/</span>
              <input value={flags} onChange={e => setFlags(e.target.value)}
                className="w-16 py-2.5 px-2 bg-transparent text-yellow-400 font-mono text-sm outline-none border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <div className="w-36">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Flags</p>
            <div className="flex gap-1 flex-wrap">
              {['g','m','i','s'].map(f => (
                <button key={f} onClick={() => setFlags(prev => prev.includes(f) ? prev.replace(f,'') : prev+f)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
                  style={{ background: flags.includes(f) ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                    color: flags.includes(f) ? '#a5b4fc' : 'rgba(255,255,255,0.3)' }}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <p className="text-xs text-white/30 uppercase tracking-wider">Test String</p>
              <span className="text-xs text-indigo-400 font-semibold">{matches.length} match{matches.length!==1?'es':''}</span>
            </div>
            <div className="rounded-xl p-4 font-mono text-sm leading-relaxed min-h-32"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              <Highlighted text={highlighted} />
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste text to test…"
              className="w-full mt-2 rounded-xl p-3 text-xs text-white/40 font-mono bg-transparent resize-none outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.06)', minHeight: 80 }} />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Replace With</p>
              <input value={replace} onChange={e => setReplace(e.target.value)} placeholder="Replacement text ($1, $2 for groups)"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white/70 font-mono outline-none"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
              {replace && pattern && (
                <div className="mt-2 rounded-xl p-3 font-mono text-xs text-green-400 whitespace-pre-wrap"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  {getReplacedText()}
                </div>
              )}
            </div>
            {matches.length > 0 && (
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">Match Details</p>
                <div className="rounded-xl overflow-hidden max-h-52 overflow-y-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  {matches.map((m, i) => (
                    <div key={i} className="px-3 py-2 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-white/25 mr-2">[{i+1}]</span>
                      <span className="text-indigo-300 font-mono">"{m[0]}"</span>
                      <span className="text-white/20 ml-2">idx:{m.index}</span>
                      {m.length > 1 && <span className="text-white/20 ml-2">groups:{[...m].slice(1).join(',')}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
