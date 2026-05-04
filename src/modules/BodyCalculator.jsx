import { useState } from 'react'

export default function BodyCalculator() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('male')
  const [activity, setActivity] = useState(1.55)

  const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age)
  const valid = w > 0 && h > 0 && a > 0

  const bmi = valid ? (w / (h / 100) ** 2).toFixed(1) : null
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
  const bmiColor = bmi < 18.5 ? '#60a5fa' : bmi < 25 ? '#34d399' : bmi < 30 ? '#fbbf24' : '#f87171'

  const bmr = valid ? (gender === 'male'
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161).toFixed(0) : null

  const tdee = bmr ? (bmr * activity).toFixed(0) : null
  const idealMin = valid ? (18.5 * (h / 100) ** 2).toFixed(1) : null
  const idealMax = valid ? (24.9 * (h / 100) ** 2).toFixed(1) : null

  const activities = [
    { v: 1.2, l: 'Sedentary' }, { v: 1.375, l: 'Light (1-3 days)' },
    { v: 1.55, l: 'Moderate (3-5 days)' }, { v: 1.725, l: 'Active (6-7 days)' },
    { v: 1.9, l: 'Very Active (athlete)' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Body Calculator</h2>
      <p className="text-white/40 text-sm mb-6">BMI, BMR, TDEE & ideal weight</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-white/30 mb-1 block">Weight (kg)</label>
          <input value={weight} onChange={e => setWeight(e.target.value)} type="number" className="input-base" placeholder="70" /></div>
        <div><label className="text-xs text-white/30 mb-1 block">Height (cm)</label>
          <input value={height} onChange={e => setHeight(e.target.value)} type="number" className="input-base" placeholder="175" /></div>
        <div><label className="text-xs text-white/30 mb-1 block">Age</label>
          <input value={age} onChange={e => setAge(e.target.value)} type="number" className="input-base" placeholder="22" /></div>
        <div><label className="text-xs text-white/30 mb-1 block">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className="input-base" style={{ cursor: 'pointer' }}>
            <option value="male">Male</option><option value="female">Female</option>
          </select></div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-white/30 mb-1 block">Activity Level</label>
        <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="input-base" style={{ cursor: 'pointer' }}>
          {activities.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
        </select>
      </div>

      {valid && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card-elevated p-5" style={{ borderLeft: `3px solid ${bmiColor}` }}>
            <span className="text-xs text-white/30">BMI</span>
            <p className="text-3xl font-bold mt-1" style={{ color: bmiColor }}>{bmi}</p>
            <p className="text-xs mt-1" style={{ color: bmiColor }}>{bmiCategory}</p>
          </div>
          <div className="card-elevated p-5" style={{ borderLeft: '3px solid #6366f1' }}>
            <span className="text-xs text-white/30">BMR</span>
            <p className="text-3xl font-bold text-indigo-400 mt-1">{bmr}</p>
            <p className="text-xs text-white/25 mt-1">cal/day at rest</p>
          </div>
          <div className="card-elevated p-5" style={{ borderLeft: '3px solid #a855f7' }}>
            <span className="text-xs text-white/30">TDEE</span>
            <p className="text-3xl font-bold text-purple-400 mt-1">{tdee}</p>
            <p className="text-xs text-white/25 mt-1">cal/day total</p>
          </div>
          <div className="card-elevated p-5" style={{ borderLeft: '3px solid #34d399' }}>
            <span className="text-xs text-white/30">Ideal Weight</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{idealMin}–{idealMax} kg</p>
            <p className="text-xs text-white/25 mt-1">BMI 18.5–24.9 range</p>
          </div>
        </div>
      )}
    </div>
  )
}
