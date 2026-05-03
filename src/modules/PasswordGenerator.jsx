import { useState } from 'react'
import { Key, RefreshCw, Copy, Check, Shield, Eye, EyeOff } from 'lucide-react'

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  similar: 'iIlL1oO0',
}

function generatePassword(length, options) {
  let pool = ''
  if (options.upper) pool += CHARS.upper
  if (options.lower) pool += CHARS.lower
  if (options.digits) pool += CHARS.digits
  if (options.symbols) pool += CHARS.symbols
  if (options.excludeSimilar) {
    for (const c of CHARS.similar) pool = pool.split(c).join('')
  }
  if (!pool) return ''
  let pw = ''
  for (let i = 0; i < length; i++) {
    pw += pool[Math.floor(Math.random() * pool.length)]
  }
  return pw
}

function strength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 14) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  if (score <= 2) return { score, label: 'Weak', color: 'rgb(248,113,113)' }
  if (score <= 4) return { score, label: 'Fair', color: 'rgb(245,158,11)' }
  if (score <= 5) return { score, label: 'Strong', color: 'rgb(52,211,153)' }
  return { score, label: 'Very Strong', color: 'rgb(99,102,241)' }
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    window.electronAPI?.writeClipboard?.(text) || navigator.clipboard?.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="p-2 rounded-lg text-white/40 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.06)' }}>
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(20)
  const [options, setOptions] = useState({ upper: true, lower: true, digits: true, symbols: true, excludeSimilar: false })
  const [passwords, setPasswords] = useState([''])
  const [count, setCount] = useState(1)
  const [showPasswords, setShowPasswords] = useState(true)

  const setOpt = (k, v) => setOptions(prev => ({ ...prev, [k]: v }))

  const generate = () => {
    const pws = Array.from({ length: Math.min(count, 20) }, () => generatePassword(length, options))
    setPasswords(pws)
  }

  const pw = passwords[0]
  const str = strength(pw)

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Password Generator</h2>
      <p className="text-white/40 text-sm mb-8">Generate cryptographically random, customizable passwords instantly.</p>

      <div className="grid grid-cols-5 gap-6">
        {/* Options */}
        <div className="col-span-2 space-y-5">
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Length: {length}</p>
            <input type="range" min="4" max="128" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-white/25">
              <span>4</span><span>32</span><span>64</span><span>128</span>
            </div>
          </div>

          <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Character Sets</p>
            {[
              { key: 'upper', label: 'Uppercase (A-Z)' },
              { key: 'lower', label: 'Lowercase (a-z)' },
              { key: 'digits', label: 'Digits (0-9)' },
              { key: 'symbols', label: 'Symbols (!@#...)' },
              { key: 'excludeSimilar', label: 'Exclude similar (il1oO0)' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setOpt(opt.key, !options[opt.key])}
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: options[opt.key] ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${options[opt.key] ? 'rgba(99,102,241,1)' : 'rgba(255,255,255,0.12)'}`
                  }}>
                  {options[opt.key] && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-white/50">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Generate: {count}</p>
            <input type="range" min="1" max="20" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full" />
          </div>

          <button onClick={generate}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}>
            <RefreshCw className="w-4 h-4" />
            Generate {count > 1 ? `${count} Passwords` : 'Password'}
          </button>
        </div>

        {/* Results */}
        <div className="col-span-3 space-y-4">
          {passwords[0] && (
            <>
              {/* Main password */}
              <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">Generated Password</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPasswords(!showPasswords)} className="p-1.5 text-white/30 hover:text-white/60 transition-colors">
                      {showPasswords ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <CopyBtn text={pw} />
                  </div>
                </div>
                <div className="bg-black/40 rounded-lg px-4 py-3">
                  <p className="font-mono text-white/80 text-base tracking-wider break-all">
                    {showPasswords ? pw : '•'.repeat(pw.length)}
                  </p>
                </div>
                {/* Strength */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/30">Strength</span>
                    <span className="text-xs font-semibold" style={{ color: str.color }}>{str.label}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(str.score / 6) * 100}%`, background: str.color }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/20">
                    <span>{pw.length} characters</span>
                    <span>~{Math.pow(Object.values(CHARS).filter((_, i) => [options.upper, options.lower, options.digits, options.symbols][i]).reduce((a, c) => a + c.length, 0), pw.length).toExponential(1)} combinations</span>
                  </div>
                </div>
              </div>

              {/* Batch */}
              {passwords.length > 1 && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="px-4 py-2.5 flex justify-between" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <p className="text-xs text-white/30">All {passwords.length} passwords</p>
                    <button onClick={() => window.electronAPI?.writeClipboard?.(passwords.join('\n'))}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Copy All</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {passwords.map((pw, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 border-t group"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <span className="font-mono text-white/50 text-sm">{showPasswords ? pw : '•'.repeat(pw.length)}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyBtn text={pw} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {!passwords[0] && (
            <div className="flex items-center justify-center h-48 rounded-xl" style={{ border: '2px dashed rgba(255,255,255,0.08)' }}>
              <div className="text-center">
                <Key className="w-10 h-10 text-white/15 mx-auto mb-3" />
                <p className="text-white/25 text-sm">Click Generate to create passwords</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
