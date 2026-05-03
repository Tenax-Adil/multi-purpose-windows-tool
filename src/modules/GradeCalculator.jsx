import { useState } from 'react'
import { Plus, Trash2, GraduationCap } from 'lucide-react'

function letterGrade(pct) {
  if (pct >= 93) return { grade:'A+', color:'rgb(52,211,153)' }
  if (pct >= 90) return { grade:'A',  color:'rgb(52,211,153)' }
  if (pct >= 87) return { grade:'A-', color:'rgb(52,211,153)' }
  if (pct >= 83) return { grade:'B+', color:'rgb(99,102,241)' }
  if (pct >= 80) return { grade:'B',  color:'rgb(99,102,241)' }
  if (pct >= 77) return { grade:'B-', color:'rgb(99,102,241)' }
  if (pct >= 73) return { grade:'C+', color:'rgb(251,191,36)' }
  if (pct >= 70) return { grade:'C',  color:'rgb(251,191,36)' }
  if (pct >= 67) return { grade:'C-', color:'rgb(251,191,36)' }
  if (pct >= 60) return { grade:'D',  color:'rgb(248,113,113)' }
  return { grade:'F', color:'rgb(248,113,113)' }
}

export default function GradeCalculator() {
  const [items, setItems]      = useState([{ id:1, name:'Midterm',   score:78, max:100, weight:30 },
                                             { id:2, name:'Assignment',score:92, max:100, weight:20 },
                                             { id:3, name:'Final',    score:85, max:100, weight:50 }])
  const [target, setTarget]    = useState(85)
  const [remaining, setRemaining] = useState({ weight:20, maxScore:100 })

  const update = (id, key, val) => setItems(it => it.map(i => i.id===id ? { ...i, [key]: Number(val)||0 } : i))
  const add    = () => setItems(it => [...it, { id: Date.now(), name:'', score:0, max:100, weight:10 }])
  const remove = (id) => setItems(it => it.filter(i => i.id!==id))

  const totalWeight = items.reduce((a, i) => a + i.weight, 0)
  const earned = items.reduce((a, i) => {
    const pct = i.max > 0 ? i.score / i.max * 100 : 0
    return a + pct * (i.weight / 100)
  }, 0)
  // Weighted percentage (normalized to assigned weights)
  const normalizedPct = totalWeight > 0 ? (earned / totalWeight * 100) : 0
  const lg = letterGrade(normalizedPct)

  // What do I need? 
  const neededPct = totalWeight < 100
    ? ((target - earned) / (remaining.weight / 100)) // raw points needed in remaining
    : null
  const neededStr = neededPct !== null
    ? `${Math.max(0, (neededPct * remaining.maxScore / 100)).toFixed(1)} / ${remaining.maxScore} (${Math.max(0,neededPct).toFixed(1)}%)`
    : 'No remaining work set'

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Grade Calculator</h2>
      <p className="text-white/40 text-sm mb-6">Calculate your weighted grade and see what you need on upcoming work.</p>

      {/* Assignments */}
      <div className="glass-card overflow-hidden mb-5">
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.3)' }}>
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Assignments & Exams</p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-white/25">Total weight: <span className={totalWeight===100?'text-green-400':'text-yellow-400'}>{totalWeight}%</span></p>
            <button onClick={add} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
          </div>
        </div>
        <div className="divide-y" style={{ divideColor:'rgba(255,255,255,0.04)' }}>
          {/* Header */}
          <div className="grid grid-cols-[1fr,80px,80px,80px,32px] gap-3 px-5 py-2 text-[10px] text-white/25 uppercase tracking-wider">
            <span>Name</span><span className="text-center">Score</span><span className="text-center">Max</span><span className="text-center">Weight %</span><span/>
          </div>
          {items.map(i => (
            <div key={i.id} className="grid grid-cols-[1fr,80px,80px,80px,32px] gap-3 px-5 py-2.5 items-center">
              <input value={i.name} onChange={e => setItems(it => it.map(x => x.id===i.id ? {...x, name:e.target.value} : x))}
                placeholder="Assignment name" className="text-sm text-white/70 bg-transparent outline-none border-b border-white/10 pb-0.5" />
              <input type="number" value={i.score} onChange={e => update(i.id,'score',e.target.value)}
                className="w-full text-center rounded-lg px-2 py-1 text-sm text-white/70 outline-none"
                style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.08)' }} />
              <input type="number" value={i.max} onChange={e => update(i.id,'max',e.target.value)}
                className="w-full text-center rounded-lg px-2 py-1 text-sm text-white/70 outline-none"
                style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.08)' }} />
              <div className="relative">
                <input type="number" value={i.weight} onChange={e => update(i.id,'weight',e.target.value)}
                  className="w-full text-center rounded-lg px-2 py-1 text-sm outline-none"
                  style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', color:'rgba(165,180,252,0.9)' }} />
              </div>
              <button onClick={() => remove(i.id)} className="text-white/15 hover:text-red-400 transition-colors justify-self-center"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="glass-card p-5 col-span-2">
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">Current Grade</p>
          <div className="flex items-end gap-4">
            <p className="text-5xl font-bold" style={{ color: lg.color }}>{lg.grade}</p>
            <p className="text-2xl font-bold text-white/80 mb-1">{normalizedPct.toFixed(1)}%</p>
          </div>
          <div className="mt-3 h-2 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all" style={{ width:`${Math.min(normalizedPct,100)}%`, background: lg.color }} />
          </div>
        </div>

        <div className="glass-card p-5 text-center flex flex-col items-center justify-center">
          <GraduationCap className="w-7 h-7 text-indigo-400 mb-2" />
          <p className="text-white/30 text-xs">Assignments</p>
          <p className="text-xl font-bold text-white/80">{items.length}</p>
          <p className="text-white/25 text-xs">{totalWeight}% weighted</p>
        </div>
      </div>

      {/* What do I need? */}
      {totalWeight < 100 && (
        <div className="glass-card p-5">
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-4">What Do I Need on Remaining Work?</p>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <p className="text-xs text-white/30 mb-1.5">Target Grade (%)</p>
              <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))}
                className="input-base text-center text-lg font-bold" />
            </div>
            <div>
              <p className="text-xs text-white/30 mb-1.5">Remaining Weight (%)</p>
              <input type="number" value={remaining.weight} onChange={e => setRemaining(r=>({...r,weight:Number(e.target.value)}))}
                className="input-base text-center" />
            </div>
            <div>
              <p className="text-xs text-white/30 mb-1.5">Max Score</p>
              <input type="number" value={remaining.maxScore} onChange={e => setRemaining(r=>({...r,maxScore:Number(e.target.value)}))}
                className="input-base text-center" />
            </div>
          </div>
          <div className="mt-4 rounded-xl p-4 text-center" style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)' }}>
            <p className="text-white/40 text-sm">You need</p>
            <p className="text-indigo-300 text-lg font-bold mt-0.5">{neededStr}</p>
            <p className="text-white/25 text-xs">on your remaining work to achieve {target}%</p>
          </div>
        </div>
      )}
    </div>
  )
}
