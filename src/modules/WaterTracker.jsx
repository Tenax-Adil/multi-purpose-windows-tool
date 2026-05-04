import { useState, useEffect } from 'react'
const KEY='nex_water'
const today=()=>new Date().toISOString().slice(0,10)
const load=()=>{try{const d=JSON.parse(localStorage.getItem(KEY));return d?.date===today()?d:{date:today(),glasses:0,goal:8,log:[]}}catch{return{date:today(),glasses:0,goal:8,log:[]}}}

export default function WaterTracker(){
  const [data,setData]=useState(load)
  const save=d=>{setData(d);localStorage.setItem(KEY,JSON.stringify(d))}
  const addGlass=()=>{
    const d={...data,glasses:data.glasses+1,log:[...data.log,new Date().toLocaleTimeString()]}
    save(d)
  }
  const removeGlass=()=>{if(data.glasses>0)save({...data,glasses:data.glasses-1,log:data.log.slice(0,-1)})}
  const pct=Math.min((data.glasses/data.goal)*100,100)
  const radius=70,circ=2*Math.PI*radius,offset=circ-(pct/100)*circ

  return(
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Water Tracker</h2>
      <p className="text-white/40 text-sm mb-6">Stay hydrated — track your daily water intake</p>

      <div className="flex gap-8 items-center mb-6">
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#3b82f6" strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              style={{transform:'rotate(-90deg)',transformOrigin:'50% 50%',transition:'stroke-dashoffset 0.4s ease'}}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white/90">{data.glasses}</span>
            <span className="text-xs text-white/30">/ {data.goal} glasses</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <button onClick={addGlass} className="btn-primary px-5 py-2.5 text-sm flex-1">💧 Add Glass</button>
            <button onClick={removeGlass} className="btn-ghost px-3 py-2.5 text-sm">Undo</button>
          </div>
          <div>
            <label className="text-xs text-white/30 mb-1 block">Daily Goal</label>
            <input type="range" min="4" max="16" value={data.goal}
              onChange={e=>save({...data,goal:+e.target.value})} className="w-full"/>
            <span className="text-xs text-white/20">{data.goal} glasses ({data.goal*250}ml)</span>
          </div>
          {pct>=100&&<p className="text-sm text-blue-400 font-semibold">🎉 Goal reached!</p>}
        </div>
      </div>

      {data.log.length>0&&(
        <div className="glass-card p-4">
          <span className="text-xs text-white/30 mb-2 block">Today's Log</span>
          <div className="flex gap-2 flex-wrap">
            {data.log.map((t,i)=>(
              <span key={i} className="text-[10px] px-2 py-1 rounded-md" style={{background:'rgba(59,130,246,0.1)',color:'rgba(96,165,250,0.8)',border:'1px solid rgba(59,130,246,0.2)'}}>
                💧 {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
