import { useState } from 'react'
const KEY='nex_studytime'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}

export default function StudyAnalytics(){
  const [sessions,setSessions]=useState(load)
  const [subject,setSubject]=useState('')
  const [hours,setHours]=useState('')

  const save=s=>{setSessions(s);localStorage.setItem(KEY,JSON.stringify(s))}
  const add=()=>{
    if(!subject.trim()||!hours)return
    save([...sessions,{id:Date.now(),subject:subject.trim(),hours:+hours,date:new Date().toISOString().slice(0,10)}])
    setSubject('');setHours('')
  }

  const subjects=[...new Set(sessions.map(s=>s.subject))]
  const totalHours=sessions.reduce((a,s)=>a+s.hours,0)
  const thisWeek=sessions.filter(s=>{const d=new Date(s.date);const now=new Date();const diff=(now-d)/(1000*60*60*24);return diff<=7})
  const weekHours=thisWeek.reduce((a,s)=>a+s.hours,0)

  const bySubject=subjects.map(sub=>{
    const hrs=sessions.filter(s=>s.subject===sub).reduce((a,s)=>a+s.hours,0)
    return{subject:sub,hours:hrs}
  }).sort((a,b)=>b.hours-a.hours)

  const maxHrs=Math.max(...bySubject.map(s=>s.hours),1)
  const colors=['#6366f1','#a855f7','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6']

  return(
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Study Analytics</h2>
      <p className="text-white/40 text-sm mb-6">Track study hours per subject</p>

      <div className="flex gap-2 mb-6">
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject…" className="input-base flex-1"
          list="sub-list" onKeyDown={e=>e.key==='Enter'&&add()}/>
        <datalist id="sub-list">{subjects.map(s=><option key={s} value={s}/>)}</datalist>
        <input value={hours} onChange={e=>setHours(e.target.value)} type="number" step="0.5" placeholder="Hours" className="input-base !w-24"/>
        <button onClick={add} className="btn-primary px-4 py-2 text-sm">Log</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-elevated p-4 text-center" style={{borderTop:'2px solid #a855f7'}}>
          <span className="text-xs text-white/30">Total Hours</span>
          <p className="text-2xl font-bold text-purple-400">{totalHours.toFixed(1)}</p>
        </div>
        <div className="card-elevated p-4 text-center" style={{borderTop:'2px solid #3b82f6'}}>
          <span className="text-xs text-white/30">This Week</span>
          <p className="text-2xl font-bold text-blue-400">{weekHours.toFixed(1)}</p>
        </div>
        <div className="card-elevated p-4 text-center" style={{borderTop:'2px solid #10b981'}}>
          <span className="text-xs text-white/30">Subjects</span>
          <p className="text-2xl font-bold text-emerald-400">{subjects.length}</p>
        </div>
      </div>

      {bySubject.length>0&&(
        <div className="glass-card p-4 mb-4">
          <span className="text-xs text-white/30 mb-3 block">Hours by Subject</span>
          <div className="space-y-2">
            {bySubject.map((s,i)=>(
              <div key={s.subject} className="flex items-center gap-3">
                <span className="text-xs text-white/50 w-24 truncate">{s.subject}</span>
                <div className="flex-1 h-5 rounded-md overflow-hidden" style={{background:'rgba(255,255,255,0.03)'}}>
                  <div className="h-full rounded-md transition-all" style={{width:`${(s.hours/maxHrs)*100}%`,background:colors[i%colors.length],opacity:0.6}}/>
                </div>
                <span className="text-xs font-mono text-white/40 w-12 text-right">{s.hours.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        {sessions.slice(-15).reverse().map(s=>(
          <div key={s.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg" style={{background:'rgba(255,255,255,0.02)'}}>
            <span className="text-xs text-white/50 flex-1">{s.subject}</span>
            <span className="text-xs font-mono text-white/30">{s.hours}h</span>
            <span className="text-[10px] text-white/15">{s.date}</span>
            <button onClick={()=>save(sessions.filter(x=>x.id!==s.id))} className="text-[10px] text-white/10 hover:text-red-400">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
