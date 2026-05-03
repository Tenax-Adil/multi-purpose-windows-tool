import { useState, useEffect } from 'react'
import { Power, Loader2, RefreshCw, Shield, ShieldOff } from 'lucide-react'

export default function StartupManager() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(new Set())

  const fetchEntries = async () => {
    setLoading(true)
    const result = await window.electronAPI.getStartupEntries()
    if (result.success) setEntries(result.entries)
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [])

  const handleToggle = async (entry) => {
    setToggling(prev => new Set([...prev, entry.name]))
    const result = await window.electronAPI.toggleStartupEntry(entry.name, entry.value, !entry.enabled)
    if (result.success) {
      setEntries(prev => prev.map(e => e.name === entry.name ? { ...e, enabled: !e.enabled } : e))
    }
    setToggling(prev => { const s = new Set(prev); s.delete(entry.name); return s })
  }

  const enabled = entries.filter(e => e.enabled)
  const disabled = entries.filter(e => !e.enabled)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Startup Manager</h2>
          <p className="text-white/40 text-sm">Control which programs launch when Windows starts. Reads from the Registry.</p>
        </div>
        <button onClick={fetchEntries} className="p-2 rounded-lg text-white/30 hover:text-white/60 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && entries.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
        </div>
      )}

      {[
        { label: 'Enabled at Startup', items: enabled, color: 'text-green-400', icon: Shield },
        { label: 'Disabled', items: disabled, color: 'text-white/20', icon: ShieldOff }
      ].filter(g => g.items.length > 0).map(group => (
        <div key={group.label} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <group.icon className={`w-4 h-4 ${group.color}`} />
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">{group.label} ({group.items.length})</p>
          </div>
          <div className="space-y-2">
            {group.items.map(entry => {
              const isToggling = toggling.has(entry.name)
              return (
                <div key={entry.name} className="flex items-center gap-4 px-5 py-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-semibold truncate">{entry.name}</p>
                    <p className="text-white/25 text-xs font-mono truncate mt-0.5">{entry.value}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(entry)}
                    disabled={isToggling}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${entry.enabled
                      ? 'text-red-400 hover:bg-red-400/10'
                      : 'text-green-400 hover:bg-green-400/10'
                    }`}
                    style={{ border: `1px solid ${entry.enabled ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}` }}
                  >
                    {isToggling
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Power className="w-3.5 h-3.5" />
                    }
                    {entry.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
