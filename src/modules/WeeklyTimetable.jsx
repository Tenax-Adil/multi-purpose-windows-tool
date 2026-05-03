import { useState } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const HOURS = Array.from({length:14}, (_,i) => i + 7) // 7am – 8pm
const COLORS = ['rgba(99,102,241,0.8)','rgba(52,211,153,0.8)','rgba(251,191,36,0.8)','rgba(248,113,113,0.8)','rgba(168,85,247,0.8)','rgba(59,130,246,0.8)']

function save(d) { localStorage.setItem('nextools_timetable', JSON.stringify(d)) }
function load()  { try { return JSON.parse(localStorage.getItem('nextools_timetable')||'[]') } catch { return [] } }

export default function WeeklyTimetable() {
  const [entries, setEntries] = useState(load)
  const [form, setForm]       = useState({ day:'Mon', start:'09:00', end:'10:00', subject:'', room:'', color: COLORS[0] })
  const [adding, setAdding]   = useState(false)

  const update = (e) => { setEntries(e); save(e) }

  const addEntry = () => {
    if (!form.subject.trim()) return
    update([...entries, { id: Date.now(), ...form }])
    setForm(f => ({ ...f, subject:'', room:'' }))
    setAdding(false)
  }

  const remove = (id) => update(entries.filter(e => e.id !== id))

  const getEntries = (day, hour) => entries.filter(e => {
    const startH = parseInt(e.start.split(':')[0])
    const endH   = parseInt(e.end.split(':')[0])
    return e.day === day && startH === hour
  })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Weekly Timetable</h2>
          <p className="text-white/40 text-sm">Your class schedule at a glance.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="glass-card p-5 mb-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">New Class</p>
          </div>
          {[
            { label:'Subject', key:'subject', type:'text', placeholder:'e.g. Mathematics', span:true },
            { label:'Room',    key:'room',    type:'text', placeholder:'e.g. A-204' },
          ].map(f => (
            <div key={f.key} className={f.span?'col-span-2':''}>
              <p className="text-xs text-white/30 mb-1.5">{f.label}</p>
              <input type={f.type} value={form[f.key]} onChange={e => setForm(x=>({...x,[f.key]:e.target.value}))}
                placeholder={f.placeholder} className="input-base text-sm" />
            </div>
          ))}
          <div>
            <p className="text-xs text-white/30 mb-1.5">Day</p>
            <select value={form.day} onChange={e => setForm(x=>({...x,day:e.target.value}))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none appearance-none"
              style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)' }}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['start','end'].map(k => (
              <div key={k}>
                <p className="text-xs text-white/30 mb-1.5 capitalize">{k}</p>
                <input type="time" value={form[k]} onChange={e => setForm(x=>({...x,[k]:e.target.value}))}
                  className="input-base text-sm" style={{ colorScheme:'dark' }} />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-white/30 mb-1.5">Color</p>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(x=>({...x,color:c}))}
                  className="w-7 h-7 rounded-lg transition-all"
                  style={{ background:c, outline: form.color===c?'2px solid white':'2px solid transparent', outlineOffset:2 }} />
              ))}
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={addEntry} className="btn-primary w-full py-2.5 text-sm">Add to Schedule</button>
          </div>
        </div>
      )}

      {/* Timetable grid */}
      <div className="glass-card overflow-auto">
        {/* Header */}
        <div className="grid sticky top-0 z-10" style={{ gridTemplateColumns:'56px repeat(7, 1fr)', background:'rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-2" />
          {DAYS.map(d => (
            <div key={d} className="p-2 text-center">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">{d}</p>
            </div>
          ))}
        </div>

        {/* Time rows */}
        {HOURS.map(hour => (
          <div key={hour} className="grid border-t" style={{ gridTemplateColumns:'56px repeat(7, 1fr)', borderColor:'rgba(255,255,255,0.04)', minHeight:52 }}>
            <div className="px-2 py-1 text-[10px] text-white/20 font-mono flex-shrink-0 pt-1">
              {hour}:00
            </div>
            {DAYS.map(day => {
              const dayEntries = getEntries(day, hour)
              return (
                <div key={day} className="border-l p-1" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                  {dayEntries.map(e => {
                    const startM = parseInt(e.start.split(':')[1])
                    const endH   = parseInt(e.end.split(':')[0])
                    const endM   = parseInt(e.end.split(':')[1])
                    const dur    = (endH - hour) + (endM - startM) / 60
                    return (
                      <div key={e.id} className="rounded-lg px-2 py-1 group relative cursor-default"
                        style={{ background:`${e.color}22`, border:`1px solid ${e.color}55`, minHeight:40 }}>
                        <p className="text-white/80 text-[11px] font-semibold leading-tight truncate">{e.subject}</p>
                        {e.room && <p className="text-white/35 text-[10px] truncate">{e.room}</p>}
                        <p className="text-white/25 text-[10px]">{e.start}–{e.end}</p>
                        <button onClick={() => remove(e.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
