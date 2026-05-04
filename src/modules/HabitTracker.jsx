import { useState } from 'react'
const KEY='nex_habits'
const today=()=>new Date().toISOString().slice(0,10)
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}

export default function HabitTracker(){
  const [habits,setHabits]=useState(load)
  const [name,setName]=useState('')
  const save=h=>{setHabits(h);localStorage.setItem(KEY,JSON.stringify(h))}

  const add=()=>{
    if(!name.trim())return
    save([...habits,{id:Date.now(),name:name.trim(),completions:[]}])
    setName('')
  }

  const toggle=(id)=>{
    const d=today()
    save(habits.map(h=>{
      if(h.id!==id)return h
      const done=h.completions.includes(d)
      return {...h,completions:done?h.completions.filter(c=>c!==d):[...h.completions,d]}
    }))
  }

  const streak=(h)=>{
    let count=0
    const d=new Date()
    for(let i=0;i<365;i++){
      const ds=new Date(d);ds.setDate(ds.getDate()-i)
      const key=ds.toISOString().slice(0,10)
      if(h.completions.includes(key))count++
      else if(i>0)break
    }
    return count
  }

  const last30=()=>{
    const days=[]
    for(let i=29;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i)
      days.push(d.toISOString().slice(0,10))
    }
    return days
  }

  return(
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Habit Tracker</h2>
      <p className="text-white/40 text-sm mb-6">Build streaks with daily habits</p>

      <div className="flex gap-2 mb-6">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New habit…"
          className="input-base flex-1" onKeyDown={e=>e.key==='Enter'&&add()}/>
        <button onClick={add} className="btn-primary px-4 py-2 text-sm">Add</button>
      </div>

      <div className="space-y-3">
        {habits.map(h=>{
          const doneToday=h.completions.includes(today())
          const s=streak(h)
          const days=last30()
          return(
            <div key={h.id} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={()=>toggle(h.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all"
                  style={{background:doneToday?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.05)',border:`1px solid ${doneToday?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.1)'}`,color:doneToday?'#34d399':'rgba(255,255,255,0.2)'}}>
                  {doneToday?'✓':''}
                </button>
                <span className="text-white/80 text-sm font-medium flex-1">{h.name}</span>
                {s>0&&<span className="text-xs font-bold" style={{color:'#f59e0b'}}>🔥 {s} day streak</span>}
                <button onClick={()=>save(habits.filter(x=>x.id!==h.id))} className="text-[10px] text-white/15 hover:text-red-400">✕</button>
              </div>
              <div className="flex gap-[3px]">
                {days.map(d=>{
                  const done=h.completions.includes(d)
                  return <div key={d} className="w-3 h-3 rounded-sm" title={d}
                    style={{background:done?'rgba(16,185,129,0.5)':'rgba(255,255,255,0.04)',border:`1px solid ${done?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.04)'}`}}/>
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
