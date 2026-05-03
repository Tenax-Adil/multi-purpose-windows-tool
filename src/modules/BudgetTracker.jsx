import { useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const CATS = {
  expense: ['Food','Transport','Books','Rent','Entertainment','Clothing','Healthcare','Other'],
  income:  ['Allowance','Part-time','Scholarship','Gift','Freelance','Other']
}

function save(e) { localStorage.setItem('nextools_budget', JSON.stringify(e)) }
function load()  { try { return JSON.parse(localStorage.getItem('nextools_budget')||'[]') } catch { return [] } }

function fmtMoney(n) { return n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }) }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BudgetTracker() {
  const [entries, setEntries] = useState(load)
  const [type, setType]       = useState('expense')
  const [amount, setAmount]   = useState('')
  const [category, setCategory] = useState(CATS.expense[0])
  const [note, setNote]       = useState('')
  const [date, setDate]       = useState(new Date().toISOString().slice(0,10))
  const [filterMonth, setFilterMonth] = useState('all')

  const update = (e) => { setEntries(e); save(e) }

  const add = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return
    update([{ id: Date.now(), type, amount: Number(amount), category, note, date }, ...entries])
    setAmount(''); setNote('')
  }

  const months = [...new Set(entries.map(e => e.date.slice(0,7)))].sort().reverse()

  const visible = entries.filter(e =>
    filterMonth === 'all' || e.date.startsWith(filterMonth)
  )

  const income  = visible.filter(e=>e.type==='income').reduce((a,e)=>a+e.amount,0)
  const expense = visible.filter(e=>e.type==='expense').reduce((a,e)=>a+e.amount,0)
  const balance = income - expense

  // Category breakdown
  const byCat = {}
  visible.filter(e=>e.type==='expense').forEach(e => { byCat[e.category] = (byCat[e.category]||0) + e.amount })
  const catEntries = Object.entries(byCat).sort((a,b)=>b[1]-a[1])

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Budget Tracker</h2>
      <p className="text-white/40 text-sm mb-6">Track your income and expenses as a student.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Income', val:income, icon: TrendingUp, color:'rgb(52,211,153)' },
          { label:'Expenses', val:expense, icon: TrendingDown, color:'rgb(248,113,113)' },
          { label:'Balance', val:balance, icon: DollarSign, color: balance>=0?'rgb(99,102,241)':'rgb(248,113,113)' },
        ].map(s => { const Icon = s.icon; return (
          <div key={s.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color:s.color }} />
              <p className="text-xs text-white/35 font-medium">{s.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: s.color }}>
              ${fmtMoney(Math.abs(s.val))}
            </p>
          </div>
        )})}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Add entry */}
        <div className="col-span-2 space-y-4">
          <div className="glass-card p-5 space-y-3">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Add Entry</p>
            <div className="flex gap-2">
              {['expense','income'].map(t => (
                <button key={t} onClick={() => { setType(t); setCategory(CATS[t][0]) }}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{ background: type===t?(t==='expense'?'rgba(248,113,113,0.2)':'rgba(52,211,153,0.2)'):'rgba(255,255,255,0.04)',
                    border:`1px solid ${type===t?(t==='expense'?'rgba(248,113,113,0.5)':'rgba(52,211,153,0.5)'):'rgba(255,255,255,0.08)'}`,
                    color: type===t?(t==='expense'?'rgb(248,113,113)':'rgb(52,211,153)'):'rgba(255,255,255,0.4)' }}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-white/30 font-bold">$</span>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" onKeyDown={e=>e.key==='Enter'&&add()}
                className="flex-1 bg-transparent text-lg font-bold text-white/80 outline-none" />
            </div>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none appearance-none"
              style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}>
              {CATS[type].map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)"
              className="input-base text-sm" />
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="input-base text-sm" style={{ colorScheme:'dark' }} />
            <button onClick={add} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Entry
            </button>
          </div>

          {/* Category breakdown */}
          {catEntries.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">Spending by Category</p>
              <div className="space-y-2">
                {catEntries.slice(0,6).map(([cat, amt]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">{cat}</span>
                      <span className="text-red-400">${fmtMoney(amt)}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width:`${(amt/expense)*100}%`, background:'rgba(248,113,113,0.7)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="col-span-3">
          {/* Month filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setFilterMonth('all')}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{ background:filterMonth==='all'?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
                border:`1px solid ${filterMonth==='all'?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.07)'}`,
                color:filterMonth==='all'?'rgba(165,180,252,1)':'rgba(255,255,255,0.35)' }}>All</button>
            {months.slice(0,6).map(m => (
              <button key={m} onClick={() => setFilterMonth(m)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{ background:filterMonth===m?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
                  border:`1px solid ${filterMonth===m?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.07)'}`,
                  color:filterMonth===m?'rgba(165,180,252,1)':'rgba(255,255,255,0.35)' }}>
                {MONTHS[parseInt(m.split('-')[1])-1]} {m.split('-')[0]}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {visible.length === 0 && <div className="text-center py-10 text-white/20"><DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No entries yet</p></div>}
            {visible.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-4 py-3 rounded-xl group"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: e.type==='income'?'rgba(52,211,153,0.15)':'rgba(248,113,113,0.15)' }}>
                  {e.type==='income'
                    ? <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-medium">{e.category}{e.note&&` — ${e.note}`}</p>
                  <p className="text-white/25 text-xs">{new Date(e.date).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-sm flex-shrink-0" style={{ color: e.type==='income'?'rgb(52,211,153)':'rgb(248,113,113)' }}>
                  {e.type==='income'?'+':'-'}${fmtMoney(e.amount)}
                </p>
                <button onClick={() => update(entries.filter(x=>x.id!==e.id))}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
