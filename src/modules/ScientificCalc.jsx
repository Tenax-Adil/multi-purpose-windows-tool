import { useState } from 'react'
import { Delete, Clock } from 'lucide-react'

function safeEval(expr) {
  try {
    const e = expr
      .replace(/π/g, 'Math.PI').replace(/e(?![a-zA-Z])/g, 'Math.E')
      .replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(')
      .replace(/asin\(/g, 'Math.asin(').replace(/acos\(/g, 'Math.acos(').replace(/atan\(/g, 'Math.atan(')
      .replace(/sqrt\(/g, 'Math.sqrt(').replace(/log\(/g, 'Math.log10(').replace(/ln\(/g, 'Math.log(')
      .replace(/abs\(/g, 'Math.abs(').replace(/ceil\(/g, 'Math.ceil(').replace(/floor\(/g, 'Math.floor(')
      .replace(/\^/g, '**').replace(/(\d)%/g, '($1/100)')
    // eslint-disable-next-line no-new-func
    const r = Function('"use strict"; return (' + e + ')')()
    if (!isFinite(r)) return 'Error'
    const s = parseFloat(r.toFixed(12))
    return String(s)
  } catch { return 'Error' }
}

const BTNS = [
  ['C', '(', ')', '%'],
  ['sin(', 'cos(', 'tan(', '√'],
  ['7','8','9','÷'],
  ['4','5','6','×'],
  ['1','2','3','−'],
  ['π','0','.','='],
  ['log(', 'ln(', '^', '+'],
]

export default function ScientificCalc() {
  const [expr, setExpr]   = useState('')
  const [history, setHistory] = useState([])
  const [lastResult, setLastResult] = useState(null)

  const push = (v) => {
    if (expr === 'Error' || (lastResult !== null && /^[\d.π]/.test(v))) {
      setExpr(lastResult !== null && /^[+\-×÷^%]/.test(v) ? lastResult + v : v)
      setLastResult(null); return
    }
    setLastResult(null)
    setExpr(e => e + v)
  }

  const press = (key) => {
    if (key === 'C')   { setExpr(''); setLastResult(null); return }
    if (key === '⌫')  { setExpr(e => e.slice(0, -1)); return }
    if (key === '=') {
      const result = safeEval(expr.replace('×','*').replace('÷','/').replace('−','-').replace('√','sqrt(') + (expr.includes('sqrt(') || expr.endsWith(')') ? '' : ''))
      setHistory(h => [{ expr, result }, ...h].slice(0, 20))
      setExpr(result)
      setLastResult(result)
      return
    }
    if (key === '√') push('sqrt('); else push(key)
  }

  const keyColor = (k) => {
    if (k === '=') return { background: 'linear-gradient(135deg,rgba(99,102,241,0.8),rgba(168,85,247,0.7))', color:'white' }
    if (k === 'C')  return { background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.3)', color:'rgba(248,113,113,0.9)' }
    if (['÷','×','−','+','^','%','(',')',].includes(k)) return { background:'rgba(99,102,241,0.12)', color:'rgba(165,180,252,0.9)' }
    if (['sin(','cos(','tan(','log(','ln(','√','π'].includes(k)) return { background:'rgba(52,211,153,0.1)', color:'rgba(52,211,153,0.9)', fontSize:11 }
    return { background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.75)' }
  }

  return (
    <div className="max-w-3xl flex gap-6">
      {/* Calculator */}
      <div className="flex-shrink-0 w-72">
        <h2 className="text-2xl font-bold text-white/90 mb-1">Calculator</h2>
        <p className="text-white/40 text-sm mb-5">Scientific expressions supported.</p>

        {/* Display */}
        <div className="rounded-2xl p-4 mb-3" style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-right">
            <p className="text-white/25 text-xs font-mono mb-1 truncate min-h-4">{expr || ' '}</p>
            <p className="text-3xl font-bold text-white/90 font-mono truncate">{expr || '0'}</p>
          </div>
        </div>

        {/* Backspace */}
        <div className="flex justify-end mb-2">
          <button onClick={() => press('⌫')} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 text-white/40 hover:text-white transition-colors" style={{ background:'rgba(255,255,255,0.06)' }}>
            <Delete className="w-3.5 h-3.5" /> DEL
          </button>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {BTNS.flat().map((k, i) => (
            <button key={i} onClick={() => press(k)}
              className="py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
              style={{ border:'1px solid rgba(255,255,255,0.07)', ...keyColor(k) }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-white/30" />
          <h3 className="text-sm font-semibold text-white/50">History</h3>
          {history.length > 0 && <button onClick={() => setHistory([])} className="text-xs text-white/20 hover:text-white/40 ml-auto transition-colors">Clear</button>}
        </div>
        <div className="space-y-2">
          {history.length === 0 && <p className="text-white/20 text-sm text-center py-8">Calculations will appear here</p>}
          {history.map((h, i) => (
            <div key={i} className="glass-card px-4 py-2.5 cursor-pointer hover:border-indigo-500/30 transition-colors"
              onClick={() => setExpr(h.result)}>
              <p className="text-white/30 text-xs font-mono">{h.expr}</p>
              <p className="text-white/80 font-semibold font-mono">{h.result}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-xs text-white/25 uppercase tracking-wider mb-3">Constants</p>
          <div className="grid grid-cols-2 gap-2">
            {[['π','3.14159…'],['e','2.71828…'],['√2','1.41421…'],['φ','1.61803…']].map(([k,v]) => (
              <button key={k} onClick={() => push(k==='√2'?'sqrt(2)':k==='φ'?'((1+sqrt(5))/2)':k)}
                className="glass-card px-3 py-2 text-left hover:border-indigo-400/30 transition-colors">
                <p className="text-white/70 font-bold text-sm">{k}</p>
                <p className="text-white/30 text-xs">{v}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
