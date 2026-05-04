import { useState } from 'react'
const KEY='nex_workouts'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}

export default function WorkoutLog(){
  const [logs,setLogs]=useState(load)
  const [exercise,setExercise]=useState('')
  const [sets,setSets]=useState('')
  const [reps,setReps]=useState('')
  const [weight,setWeight]=useState('')
  const [filter,setFilter]=useState('')

  const save=l=>{setLogs(l);localStorage.setItem(KEY,JSON.stringify(l))}
  const add=()=>{
    if(!exercise.trim())return
    const entry={id:Date.now(),exercise:exercise.trim(),sets:+sets||0,reps:+reps||0,weight:+weight||0,date:new Date().toLocaleDateString()}
    save([entry,...logs]);setExercise('');setSets('');setReps('');setWeight('')
  }

  const exercises=[...new Set(logs.map(l=>l.exercise))]
  const filtered=filter?logs.filter(l=>l.exercise===filter):logs

  const getPR=name=>{
    const ex=logs.filter(l=>l.exercise===name)
    return ex.length?Math.max(...ex.map(l=>l.weight)):0
  }

  return(
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Workout Log</h2>
      <p className="text-white/40 text-sm mb-6">Track exercises, sets, reps & PRs</p>
      <div className="glass-card p-4 mb-4">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <input value={exercise} onChange={e=>setExercise(e.target.value)} placeholder="Exercise name" className="input-base text-sm" list="ex-list"/>
          <datalist id="ex-list">{exercises.map(e=><option key={e} value={e}/>)}</datalist>
          <input value={sets} onChange={e=>setSets(e.target.value)} type="number" placeholder="Sets" className="input-base text-sm"/>
          <input value={reps} onChange={e=>setReps(e.target.value)} type="number" placeholder="Reps" className="input-base text-sm"/>
          <input value={weight} onChange={e=>setWeight(e.target.value)} type="number" placeholder="Weight (kg)" className="input-base text-sm"/>
        </div>
        <button onClick={add} className="btn-primary px-4 py-2 text-xs">Log Exercise</button>
      </div>

      {exercises.length>0&&(
        <div className="mb-4">
          <span className="text-xs text-white/30 mb-2 block">PR Board</span>
          <div className="flex gap-2 flex-wrap">
            {exercises.map(e=>(
              <div key={e} className="glass-card px-3 py-2 cursor-pointer" onClick={()=>setFilter(filter===e?'':e)}
                style={filter===e?{borderColor:'rgba(239,68,68,0.4)',background:'rgba(239,68,68,0.08)'}:{}}>
                <span className="text-xs text-white/60">{e}</span>
                <span className="text-xs font-bold text-red-400 ml-2">{getPR(e)}kg</span>
              </div>
            ))}
            {filter&&<button onClick={()=>setFilter('')} className="text-[10px] text-white/30 hover:text-white/50">Clear</button>}
          </div>
        </div>
      )}

      <div className="space-y-1">
        {filtered.slice(0,30).map(l=>(
          <div key={l.id} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
            <span className="text-sm text-white/70 flex-1">{l.exercise}</span>
            <span className="text-xs text-white/40">{l.sets}×{l.reps}</span>
            <span className="text-xs font-mono text-red-400/70">{l.weight}kg</span>
            <span className="text-[10px] text-white/20">{l.date}</span>
            <button onClick={()=>save(logs.filter(x=>x.id!==l.id))} className="text-[10px] text-white/15 hover:text-red-400">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
