import { useState } from 'react'

const BASES = [
  { label: 'Binary (2)', base: 2, prefix: '0b' },
  { label: 'Octal (8)', base: 8, prefix: '0o' },
  { label: 'Decimal (10)', base: 10, prefix: '' },
  { label: 'Hexadecimal (16)', base: 16, prefix: '0x' },
]

export default function BaseConverter() {
  const [input, setInput] = useState('')
  const [fromBase, setFromBase] = useState(10)

  let decimal = NaN
  try { decimal = parseInt(input, fromBase) } catch {}
  const valid = !isNaN(decimal) && input.trim() !== ''

  const bits = valid ? decimal.toString(2).padStart(Math.ceil(decimal.toString(2).length / 8) * 8, '0') : ''

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Base Converter</h2>
      <p className="text-white/40 text-sm mb-6">Convert between Binary, Octal, Decimal, and Hexadecimal</p>

      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <label className="text-xs text-white/40 mb-1 block">Input Value</label>
          <input value={input} onChange={e => setInput(e.target.value)}
            className="input-base font-mono text-lg" placeholder="Enter a number…" />
        </div>
        <div className="w-48">
          <label className="text-xs text-white/40 mb-1 block">Input Base</label>
          <select value={fromBase} onChange={e => setFromBase(Number(e.target.value))}
            className="input-base" style={{ cursor: 'pointer' }}>
            {BASES.map(b => <option key={b.base} value={b.base}>{b.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {BASES.map(b => (
          <div key={b.base} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">{b.label}</span>
              {valid && <button onClick={() => navigator.clipboard.writeText(b.prefix + decimal.toString(b.base).toUpperCase())}
                className="text-[10px] text-indigo-400 hover:text-indigo-300">Copy</button>}
            </div>
            <p className="font-mono text-lg text-white/80 break-all">
              {valid ? <><span className="text-white/25">{b.prefix}</span>{decimal.toString(b.base).toUpperCase()}</> : <span className="text-white/15">—</span>}
            </p>
          </div>
        ))}
      </div>

      {valid && bits && (
        <div className="glass-card p-4">
          <span className="text-xs text-white/40 mb-2 block">Bit Field ({bits.length}-bit)</span>
          <div className="flex flex-wrap gap-1">
            {bits.split('').map((bit, i) => (
              <div key={i} className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs"
                style={{ background: bit === '1' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.03)',
                  color: bit === '1' ? '#a5b4fc' : 'rgba(255,255,255,0.2)',
                  border: `1px solid ${bit === '1' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                {bit}
              </div>
            ))}
          </div>
          {bits.length >= 8 && <p className="text-[10px] text-white/20 mt-2">
            Bytes: {bits.match(/.{8}/g)?.map(b => parseInt(b, 2)).join(' · ')}
          </p>}
        </div>
      )}
    </div>
  )
}
