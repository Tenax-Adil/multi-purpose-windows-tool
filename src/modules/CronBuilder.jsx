import { useState } from 'react'

const FIELDS = ['minute','hour','day','month','weekday']
const LABELS = ['Minute','Hour','Day of Month','Month','Day of Week']
const RANGES = ['0-59','0-23','1-31','1-12','0-6']
const SPECIALS = [
  {label:'Every minute',expr:'* * * * *'},{label:'Hourly',expr:'0 * * * *'},
  {label:'Daily midnight',expr:'0 0 * * *'},{label:'Weekly Monday',expr:'0 0 * * 1'},
  {label:'Monthly 1st',expr:'0 0 1 * *'},{label:'Every 5 min',expr:'*/5 * * * *'},
]

function describeCron(parts) {
  if(parts.length!==5)return 'Invalid'
  const [min,hr,dom,mon,dow]=parts
  let d=''
  if(parts.every(p=>p==='*'))return 'Every minute'
  if(min!=='*')d+=`At minute ${min} `
  if(hr!=='*')d+=`past hour ${hr} `
  if(dom!=='*')d+=`on day ${dom} `
  if(mon!=='*')d+=`in month ${mon} `
  if(dow!=='*')d+=`on weekday ${dow}`
  return d.trim()||'Every minute'
}

export default function CronBuilder() {
  const [vals, setVals] = useState({minute:'*',hour:'*',day:'*',month:'*',weekday:'*'})
  const expr = FIELDS.map(f=>vals[f]).join(' ')
  const parts = expr.split(' ')

  const set = (field, val) => setVals(v => ({...v, [field]: val}))
  const load = e => { const p=e.split(' '); FIELDS.forEach((f,i)=>set(f,p[i]||'*')) }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Cron Builder</h2>
      <p className="text-white/40 text-sm mb-6">Build cron expressions visually</p>

      <div className="glass-card p-5 mb-4 text-center">
        <p className="font-mono text-2xl text-white/90 tracking-widest mb-2">{expr}</p>
        <p className="text-sm text-indigo-300/70">{describeCron(parts)}</p>
        <button onClick={()=>navigator.clipboard.writeText(expr)} className="btn-ghost px-4 py-1.5 text-xs mt-3">Copy</button>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {FIELDS.map((f,i)=>(
          <div key={f} className="glass-card p-3">
            <label className="text-[10px] text-white/40 block mb-1">{LABELS[i]}</label>
            <input value={vals[f]} onChange={e=>set(f,e.target.value)}
              className="input-base font-mono text-center text-sm" placeholder="*"/>
            <span className="text-[9px] text-white/20 block mt-1 text-center">{RANGES[i]}</span>
          </div>
        ))}
      </div>

      <h3 className="text-xs text-white/30 font-semibold mb-2 uppercase tracking-wider">Presets</h3>
      <div className="flex flex-wrap gap-2">
        {SPECIALS.map(s=>(
          <button key={s.expr} onClick={()=>load(s.expr)}
            className="btn-ghost px-3 py-1.5 text-xs font-mono">{s.label} <span className="text-white/20 ml-1">{s.expr}</span></button>
        ))}
      </div>
    </div>
  )
}
