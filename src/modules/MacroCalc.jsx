import { useState } from 'react'

const GOALS = [
  { id: 'cut', label: 'Fat Loss', pMul: 2.2, fMul: 0.9, cal: -500 },
  { id: 'maintain', label: 'Maintain', pMul: 1.8, fMul: 1.0, cal: 0 },
  { id: 'bulk', label: 'Muscle Gain', pMul: 2.0, fMul: 1.0, cal: 400 },
]

export default function MacroCalc() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('male')
  const [activity, setActivity] = useState(1.55)
  const [goal, setGoal] = useState('maintain')

  const w = +weight, h = +height, a = +age
  const valid = w > 0 && h > 0 && a > 0
  const g = GOALS.find(x => x.id === goal)

  const bmr = valid ? (gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161) : 0
  const tdee = bmr * activity
  const targetCal = Math.round(tdee + g.cal)
  const protein = Math.round(w * g.pMul)
  const fat = Math.round(w * g.fMul)
  const carbCal = targetCal - (protein * 4 + fat * 9)
  const carbs = Math.max(0, Math.round(carbCal / 4))

  const macros = [
    { label: 'Protein', g: protein, cal: protein * 4, color: '#3b82f6', pct: ((protein * 4) / targetCal * 100).toFixed(0) },
    { label: 'Carbs', g: carbs, cal: carbs * 4, color: '#f59e0b', pct: ((carbs * 4) / targetCal * 100).toFixed(0) },
    { label: 'Fat', g: fat, cal: fat * 9, color: '#ef4444', pct: ((fat * 9) / targetCal * 100).toFixed(0) },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Macro Calculator</h2>
      <p className="text-white/40 text-sm mb-6">Calculate calorie & macro targets</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-white/30 mb-1 block">Weight (kg)</label>
          <input value={weight} onChange={e => setWeight(e.target.value)} type="number" className="input-base" /></div>
        <div><label className="text-xs text-white/30 mb-1 block">Height (cm)</label>
          <input value={height} onChange={e => setHeight(e.target.value)} type="number" className="input-base" /></div>
        <div><label className="text-xs text-white/30 mb-1 block">Age</label>
          <input value={age} onChange={e => setAge(e.target.value)} type="number" className="input-base" /></div>
        <div><label className="text-xs text-white/30 mb-1 block">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className="input-base" style={{ cursor: 'pointer' }}>
            <option value="male">Male</option><option value="female">Female</option></select></div>
      </div>

      <div className="flex gap-2 mb-4">
        {GOALS.map(gl => (
          <button key={gl.id} onClick={() => setGoal(gl.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${goal === gl.id ? 'btn-primary' : 'btn-ghost'}`}>
            {gl.label}
          </button>
        ))}
      </div>

      {valid && (
        <>
          <div className="card-elevated p-5 text-center mb-4" style={{ borderTop: '2px solid #a855f7' }}>
            <span className="text-xs text-white/30">Daily Target</span>
            <p className="text-4xl font-bold text-purple-400 mt-1">{targetCal}</p>
            <p className="text-xs text-white/25 mt-1">calories/day ({g.cal > 0 ? '+' : ''}{g.cal} from TDEE {Math.round(tdee)})</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {macros.map(m => (
              <div key={m.label} className="card-elevated p-4 text-center" style={{ borderTop: `2px solid ${m.color}` }}>
                <span className="text-xs text-white/30">{m.label}</span>
                <p className="text-2xl font-bold mt-1" style={{ color: m.color }}>{m.g}g</p>
                <p className="text-[10px] text-white/20">{m.cal} cal · {m.pct}%</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-3">
            <div className="flex h-4 rounded-full overflow-hidden">
              {macros.map(m => (
                <div key={m.label} style={{ width: `${m.pct}%`, background: m.color, transition: 'width 0.3s' }}
                  title={`${m.label}: ${m.pct}%`} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
