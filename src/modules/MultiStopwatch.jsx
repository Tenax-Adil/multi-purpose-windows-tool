import { useState, useEffect, useRef } from 'react'

function Timer({name,onRemove,onRename}){
  const [time,setTime]=useState(0)
  const [running,setRunning]=useState(false)
  const intervalRef=useRef(null)

  useEffect(()=>{
    if(running) intervalRef.current=setInterval(()=>setTime(t=>t+10),10)
    else clearInterval(intervalRef.current)
    return()=>clearInterval(intervalRef.current)
  },[running])

  const fmt=ms=>{
    const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000),cs=Math.floor((ms%1000)/10)
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`
  }

  return(
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <input value={name} onChange={e=>onRename(e.target.value)} className="text-sm text-white/70 bg-transparent border-none outline-none font-medium w-24"/>
        <button onClick={onRemove} className="text-[10px] text-white/15 hover:text-red-400">✕</button>
      </div>
      <p className="font-mono text-2xl text-white/90 mb-3 tracking-wider">{fmt(time)}</p>
      <div className="flex gap-1.5">
        <button onClick={()=>setRunning(!running)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${running?'btn-ghost':'btn-primary'}`}>
          {running?'Pause':'Start'}
        </button>
        <button onClick={()=>{setRunning(false);setTime(0)}} className="btn-ghost px-3 py-1.5 text-xs">Reset</button>
      </div>
    </div>
  )
}

export default function MultiStopwatch(){
  const [timers,setTimers]=useState([{id:1,name:'Timer 1'}])
  const add=()=>{if(timers.length>=6)return;setTimers(t=>[...t,{id:Date.now(),name:`Timer ${t.length+1}`}])}
  const remove=id=>setTimers(t=>t.filter(x=>x.id!==id))
  const rename=(id,name)=>setTimers(t=>t.map(x=>x.id===id?{...x,name}:x))

  return(
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Multi Stopwatch</h2>
      <p className="text-white/40 text-sm mb-6">Up to 6 simultaneous stopwatches</p>
      <button onClick={add} disabled={timers.length>=6} className="btn-primary px-4 py-2 text-sm mb-4">
        + Add Stopwatch ({timers.length}/6)
      </button>
      <div className="grid grid-cols-3 gap-3">
        {timers.map(t=><Timer key={t.id} name={t.name} onRemove={()=>remove(t.id)} onRename={n=>rename(t.id,n)}/>)}
      </div>
    </div>
  )
}
