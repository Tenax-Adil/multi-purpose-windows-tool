import { useState } from 'react'
import { Plus, Trash2, Check, Circle, Tag, Calendar, AlertCircle } from 'lucide-react'

const SUBJECTS  = ['All','Math','Science','English','History','CS','Art','Other']
const PRIORITIES = [{ id:'high',label:'High',color:'rgb(248,113,113)'},{id:'medium',label:'Medium',color:'rgb(251,191,36)'},{id:'low',label:'Low',color:'rgb(52,211,153)'}]
function save(t) { localStorage.setItem('nextools_studytodo', JSON.stringify(t)) }
function load()  { try { return JSON.parse(localStorage.getItem('nextools_studytodo')||'[]') } catch { return [] } }

export default function StudyTodo() {
  const [tasks, setTasks]       = useState(load)
  const [title, setTitle]       = useState('')
  const [subject, setSubject]   = useState('Other')
  const [priority, setPriority] = useState('medium')
  const [due, setDue]           = useState('')
  const [filter, setFilter]     = useState('All')
  const [showDone, setShowDone] = useState(false)

  const update = (t) => { setTasks(t); save(t) }

  const addTask = () => {
    if (!title.trim()) return
    update([{ id: Date.now(), title: title.trim(), subject, priority, due, done: false }, ...tasks])
    setTitle(''); setDue('')
  }

  const toggle  = (id) => update(tasks.map(t => t.id===id ? { ...t, done: !t.done } : t))
  const remove  = (id) => update(tasks.filter(t => t.id!==id))

  const visible = tasks.filter(t => {
    const matchFilter  = filter === 'All' || t.subject === filter
    const matchDone    = showDone ? true : !t.done
    return matchFilter && matchDone
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const pri = { high:0, medium:1, low:2 }
    return pri[a.priority] - pri[b.priority]
  })

  const pending = tasks.filter(t => !t.done).length
  const overdue = tasks.filter(t => !t.done && t.due && new Date(t.due) < new Date()).length

  return (
    <div className="max-w-3xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Study To-Do</h2>
          <p className="text-white/40 text-sm">{pending} pending · {overdue > 0 && <span className="text-red-400">{overdue} overdue</span>}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
          <input type="checkbox" checked={showDone} onChange={e=>setShowDone(e.target.checked)} className="accent-indigo-500" />
          Show completed
        </label>
      </div>

      {/* Add task */}
      <div className="glass-card p-5 mb-5 space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you need to study or do?"
          onKeyDown={e => e.key==='Enter' && addTask()} className="input-base text-sm" />
        <div className="flex gap-3">
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none appearance-none"
            style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}>
            {SUBJECTS.filter(s=>s!=='All').map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex gap-1">
            {PRIORITIES.map(p => (
              <button key={p.id} onClick={() => setPriority(p.id)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: priority===p.id?`${p.color}22`:'rgba(255,255,255,0.04)',
                  border:`1px solid ${priority===p.id?p.color:'rgba(255,255,255,0.08)'}`,
                  color: priority===p.id?p.color:'rgba(255,255,255,0.35)' }}>{p.label}</button>
            ))}
          </div>
          <input type="date" value={due} onChange={e => setDue(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', colorScheme:'dark' }} />
          <button onClick={addTask} className="btn-primary px-4 py-2 text-sm"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Subject filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: filter===s?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
              border:`1px solid ${filter===s?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.07)'}`,
              color: filter===s?'rgba(165,180,252,1)':'rgba(255,255,255,0.35)' }}>{s}</button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {visible.map(t => {
          const pr    = PRIORITIES.find(p=>p.id===t.priority)
          const isOvd = t.due && !t.done && new Date(t.due) < new Date()
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group"
              style={{ background: t.done?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)', opacity: t.done?0.5:1 }}>
              <button onClick={() => toggle(t.id)} className="flex-shrink-0 transition-colors">
                {t.done
                  ? <Check className="w-4 h-4 text-green-400" />
                  : <Circle className="w-4 h-4" style={{ color: pr.color }} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${t.done?'line-through text-white/30':'text-white/75'}`}>{t.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>{t.subject}</span>
                  {t.due && <span className={`text-xs flex items-center gap-1 ${isOvd?'text-red-400':'text-white/30'}`}>
                    {isOvd && <AlertCircle className="w-3 h-3" />}
                    {new Date(t.due).toLocaleDateString()}
                  </span>}
                </div>
              </div>
              <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ background: `${pr.color}66` }} />
              <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
        {visible.length === 0 && <div className="text-center py-10 text-white/20"><Circle className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No tasks here</p></div>}
      </div>
    </div>
  )
}
