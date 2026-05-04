import { useState, useEffect } from 'react'
const KEY='nex_deadlines'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch{return[]}}

export default function HomeworkDeadline(){
  const [items,setItems]=useState(load)
  const [title,setTitle]=useState('')
  const [subject,setSubject]=useState('')
  const [due,setDue]=useState('')
  const [now,setNow]=useState(Date.now())

  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(t)},[])
  const save=l=>{setItems(l);localStorage.setItem(KEY,JSON.stringify(l))}
  const add=()=>{
    if(!title.trim()||!due)return
    save([...items,{id:Date.now(),title:title.trim(),subject:subject.trim(),due,done:false}])
    setTitle('');setSubject('');setDue('')
  }
  const toggle=id=>save(items.map(i=>i.id===id?{...i,done:!i.done}:i))
  const del=id=>save(items.filter(i=>i.id!==id))

  const remaining=item=>{
    const ms=new Date(item.due).getTime()-now
    if(ms<=0)return{text:'OVERDUE',color:'#ef4444',urgent:true}
    const h=Math.floor(ms/3600000),d=Math.floor(h/24)
    if(d>0)return{text:`${d}d ${h%24}h`,color:d<=1?'#f59e0b':'#10b981',urgent:d<=1}
    return{text:`${h}h ${Math.floor((ms%3600000)/60000)}m`,color:h<=6?'#ef4444':'#f59e0b',urgent:true}
  }

  const sorted=[...items].sort((a,b)=>new Date(a.due)-new Date(b.due))
  const active=sorted.filter(i=>!i.done)
  const completed=sorted.filter(i=>i.done)

  return(
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Homework Deadlines</h2>
      <p className="text-white/40 text-sm mb-6">Countdown timers for assignments</p>

      <div className="glass-card p-4 mb-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Assignment title" className="input-base text-sm"/>
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className="input-base text-sm"/>
          <input value={due} onChange={e=>setDue(e.target.value)} type="datetime-local" className="input-base text-sm"/>
        </div>
        <button onClick={add} className="btn-primary px-4 py-2 text-xs">Add Deadline</button>
      </div>

      <div className="space-y-2 mb-4">
        {active.map(item=>{
          const r=remaining(item)
          return(
            <div key={item.id} className="card-elevated p-4 flex items-center gap-3" style={{borderLeft:`3px solid ${r.color}`}}>
              <button onClick={()=>toggle(item.id)} className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-medium">{item.title}</p>
                {item.subject&&<span className="text-[10px] text-white/25">{item.subject}</span>}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono" style={{color:r.color}}>{r.text}</p>
                <p className="text-[10px] text-white/20">{new Date(item.due).toLocaleDateString()}</p>
              </div>
              <button onClick={()=>del(item.id)} className="text-[10px] text-white/15 hover:text-red-400">✕</button>
            </div>
          )
        })}
      </div>

      {completed.length>0&&(
        <div>
          <span className="text-xs text-white/20 block mb-2">Completed ({completed.length})</span>
          {completed.map(item=>(
            <div key={item.id} className="flex items-center gap-3 py-1.5 px-3 opacity-40">
              <button onClick={()=>toggle(item.id)} className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[8px] text-emerald-400">✓</button>
              <span className="text-xs text-white/40 line-through flex-1">{item.title}</span>
              <button onClick={()=>del(item.id)} className="text-[10px] text-white/10 hover:text-red-400">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
