import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'

const CATEGORIES = {
  Length: {
    units: ['mm','cm','m','km','in','ft','yd','mi'],
    base: { mm:0.001, cm:0.01, m:1, km:1000, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344 }
  },
  Weight: {
    units: ['mg','g','kg','lb','oz','ton'],
    base: { mg:0.000001, g:0.001, kg:1, lb:0.453592, oz:0.0283495, ton:1000 }
  },
  Temperature: { units: ['°C','°F','K'], special: true },
  Area: {
    units: ['mm²','cm²','m²','km²','ft²','acre','hectare'],
    base: { 'mm²':1e-6,'cm²':1e-4,'m²':1,'km²':1e6,'ft²':0.0929,'acre':4046.86,'hectare':10000 }
  },
  Volume: {
    units: ['ml','l','m³','tsp','tbsp','cup','gal'],
    base: { ml:0.001,l:1,'m³':1000,tsp:0.00493,tbsp:0.0148,cup:0.236588,gal:3.78541 }
  },
  Speed: {
    units: ['m/s','km/h','mph','knot'],
    base: { 'm/s':1,'km/h':0.277778,mph:0.44704,knot:0.514444 }
  },
  Data: {
    units: ['B','KB','MB','GB','TB','PB'],
    base: { B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776,PB:1125899906842624 }
  },
  Time: {
    units: ['ms','s','min','h','day','week','year'],
    base: { ms:0.001,s:1,min:60,h:3600,day:86400,week:604800,year:31557600 }
  }
}

function convertTemp(val, from, to) {
  let c = from==='°C'?val : from==='°F'?(val-32)*5/9 : val-273.15
  return to==='°C'?c : to==='°F'?c*9/5+32 : c+273.15
}

function convert(val, from, to, category) {
  if (!val || isNaN(val)) return ''
  if (category === 'Temperature') return convertTemp(Number(val), from, to).toFixed(6).replace(/\.?0+$/, '')
  const cat = CATEGORIES[category]
  const inBase = Number(val) * cat.base[from]
  return (inBase / cat.base[to]).toFixed(10).replace(/\.?0+$/, '')
}

export default function UnitConverter() {
  const [category, setCategory] = useState('Length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit]     = useState('ft')
  const [fromVal, setFromVal]   = useState('')
  const [toVal, setToVal]       = useState('')

  const cat = CATEGORIES[category]

  const setCategory2 = (c) => {
    setCategory(c); setFromVal(''); setToVal('')
    setFromUnit(CATEGORIES[c].units[0])
    setToUnit(CATEGORIES[c].units[1])
  }

  const handleFrom = (v) => { setFromVal(v); setToVal(convert(v, fromUnit, toUnit, category)) }
  const handleTo   = (v) => { setToVal(v);   setFromVal(convert(v, toUnit, fromUnit, category)) }
  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit); setFromVal(toVal); setToVal(fromVal) }

  const handleFromUnit = (u) => { setFromUnit(u); setToVal(convert(fromVal, u, toUnit, category)) }
  const handleToUnit   = (u) => { setToUnit(u);   setToVal(convert(fromVal, fromUnit, u, category)) }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Unit Converter</h2>
      <p className="text-white/40 text-sm mb-6">Convert between units across 8 categories instantly.</p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.keys(CATEGORIES).map(c => (
          <button key={c} onClick={() => setCategory2(c)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: category===c?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
              border:`1px solid ${category===c?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.08)'}`,
              color: category===c?'rgba(165,180,252,1)':'rgba(255,255,255,0.4)' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
          {/* From */}
          <div className="space-y-3">
            <select value={fromUnit} onChange={e => handleFromUnit(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 outline-none appearance-none cursor-pointer"
              style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.12)' }}>
              {cat.units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={fromVal} onChange={e => handleFrom(e.target.value)}
              placeholder="0" className="input-base text-xl font-bold text-center" />
          </div>

          {/* Swap */}
          <button onClick={swap} className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)' }}>
            <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
          </button>

          {/* To */}
          <div className="space-y-3">
            <select value={toUnit} onChange={e => handleToUnit(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 outline-none appearance-none cursor-pointer"
              style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.12)' }}>
              {cat.units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={toVal} onChange={e => handleTo(e.target.value)}
              placeholder="0" className="input-base text-xl font-bold text-center" />
          </div>
        </div>

        {fromVal && toVal && (
          <div className="mt-5 pt-5 text-center" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white/50 text-sm">
              <span className="text-white/80 font-semibold">{fromVal} {fromUnit}</span>
              <span className="text-white/25 mx-2">=</span>
              <span className="text-indigo-400 font-semibold">{toVal} {toUnit}</span>
            </p>
          </div>
        )}
      </div>

      {/* Quick reference — all conversions from fromVal */}
      {fromVal && (
        <div className="mt-5 glass-card p-4">
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">All Conversions from {fromVal} {fromUnit}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {cat.units.filter(u => u!==fromUnit).map(u => (
              <div key={u} className="flex justify-between text-sm">
                <span className="text-white/30">{u}</span>
                <span className="text-white/65 font-mono">{convert(fromVal, fromUnit, u, category)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
