import { useState, useEffect, useRef, useCallback } from 'react'
import { Activity, Search, Trash2, Loader2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react'

function fmtMem(kb) {
  if (!kb) return '—'
  if (kb < 1024) return kb + ' KB'
  return (kb / 1024).toFixed(1) + ' MB'
}

export default function ProcessManager() {
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('mem')
  const [sortDir, setSortDir] = useState('desc')
  const [killing, setKilling] = useState(new Set())
  const intervalRef = useRef()

  const fetchProcesses = useCallback(async () => {
    const result = await window.electronAPI.getProcessList()
    if (result.success) setProcesses(result.processes)
    setLoading(false)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchProcesses()
    intervalRef.current = setInterval(fetchProcesses, 4000)
    return () => clearInterval(intervalRef.current)
  }, [fetchProcesses])

  const handleKill = async (pid, name) => {
    if (!confirm(`Kill process "${name}" (PID ${pid})?`)) return
    setKilling(prev => new Set([...prev, pid]))
    await window.electronAPI.killProcess(pid)
    await fetchProcesses()
    setKilling(prev => { const s = new Set(prev); s.delete(pid); return s })
  }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = processes
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = sortKey === 'mem' ? a.mem : a.pid
      const bv = sortKey === 'mem' ? b.mem : b.pid
      return sortDir === 'asc' ? av - bv : bv - av
    })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  const totalMem = processes.reduce((a, p) => a + p.mem, 0)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Process Manager</h2>
          <p className="text-white/40 text-sm">View and manage running Windows processes. Updates every 4 seconds.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">{processes.length} processes · {fmtMem(totalMem)} total</span>
          <button onClick={() => { setLoading(true); fetchProcesses() }}
            className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <RefreshCw className={`w-4 h-4 text-white/40 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search processes..."
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/70 outline-none"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.5)' }}>
              <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Name</th>
              <th
                className="text-right px-4 py-3 text-white/30 font-semibold uppercase tracking-wider cursor-pointer hover:text-white/60 select-none"
                onClick={() => toggleSort('pid')}
              >
                <span className="flex items-center justify-end gap-1">PID <SortIcon col="pid" /></span>
              </th>
              <th
                className="text-right px-4 py-3 text-white/30 font-semibold uppercase tracking-wider cursor-pointer hover:text-white/60 select-none"
                onClick={() => toggleSort('mem')}
              >
                <span className="flex items-center justify-end gap-1">Memory <SortIcon col="mem" /></span>
              </th>
              <th className="text-right px-4 py-3 text-white/30 font-semibold uppercase tracking-wider w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((p, i) => (
              <tr key={p.pid} className="border-t group"
                style={{ borderColor: 'rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400/60 flex-shrink-0" />
                    <span className="text-white/60 font-mono">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right text-white/30 font-mono">{p.pid}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={p.mem > 500000 ? 'text-red-400' : p.mem > 100000 ? 'text-yellow-400' : 'text-white/40'}>
                    {fmtMem(p.mem)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => handleKill(p.pid, p.name)}
                    disabled={killing.has(p.pid)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto px-2 py-1 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
                  >
                    {killing.has(p.pid) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Kill
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-white/20">No processes match "{search}"</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <div className="px-4 py-2 text-xs text-white/20 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            Showing first 100 of {filtered.length} results. Refine your search.
          </div>
        )}
      </div>
    </div>
  )
}
