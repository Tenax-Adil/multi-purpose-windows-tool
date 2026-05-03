import { useState, useEffect, useRef } from 'react'
import { Monitor, Cpu, HardDrive, Wifi, RefreshCw } from 'lucide-react'

function Gauge({ value, label, color, unit = '%' }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - value / 100)
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(value)}</span>
          <span className="text-xs text-white/30">{unit}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-white/50 font-medium">{label}</p>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <span className="text-white/40 text-sm">{label}</span>
      <span className="text-white/70 text-sm font-mono">{value}</span>
    </div>
  )
}

function fmtBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + ' MB'
  return (bytes / 1024 ** 3).toFixed(1) + ' GB'
}

export default function SystemDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef()

  const fetchStats = async () => {
    const result = await window.electronAPI.getSystemStats()
    if (result.success) setStats(result.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
    intervalRef.current = setInterval(fetchStats, 2000)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-white/20 animate-spin" />
    </div>
  )

  const cpuPct = stats?.cpu?.currentLoad ?? 0
  const ramPct = stats?.mem ? (stats.mem.used / stats.mem.total * 100) : 0
  const diskUsed = stats?.disk?.[0]?.used ?? 0
  const diskSize = stats?.disk?.[0]?.size ?? 1
  const diskPct = (diskUsed / diskSize) * 100
  const netUp = stats?.network?.[0]?.tx_sec ?? 0
  const netDown = stats?.network?.[0]?.rx_sec ?? 0

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">System Dashboard</h2>
          <p className="text-white/40 text-sm">Live system performance metrics. Updates every 2 seconds.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Gauges */}
      <div className="rounded-2xl p-8 mb-6 flex justify-around" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Gauge value={cpuPct} label="CPU" color="rgba(99,102,241,0.9)" />
        <Gauge value={ramPct} label="RAM" color="rgba(168,85,247,0.9)" />
        <Gauge value={diskPct} label="Disk" color="rgba(245,158,11,0.9)" />
        <div className="flex flex-col items-center justify-center">
          <Wifi className="w-8 h-8 text-blue-400 mb-2" />
          <p className="text-white/60 text-sm font-mono">↑ {fmtBytes(netUp)}/s</p>
          <p className="text-white/60 text-sm font-mono">↓ {fmtBytes(netDown)}/s</p>
          <p className="mt-2 text-sm text-white/50 font-medium">Network</p>
        </div>
      </div>

      {/* Detail Panels */}
      <div className="grid grid-cols-3 gap-6">
        {/* CPU */}
        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <p className="text-white/60 text-sm font-semibold">CPU</p>
          </div>
          <StatRow label="Model" value={stats?.cpu?.brand?.slice(0, 20) + '...' || '—'} />
          <StatRow label="Cores" value={`${stats?.cpu?.physicalCores} Physical / ${stats?.cpu?.cores} Logical`} />
          <StatRow label="Speed" value={`${stats?.cpu?.speed} GHz`} />
          <StatRow label="Load" value={`${cpuPct.toFixed(1)}%`} />
        </div>

        {/* Memory */}
        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-purple-400" />
            <p className="text-white/60 text-sm font-semibold">Memory</p>
          </div>
          <StatRow label="Total" value={fmtBytes(stats?.mem?.total)} />
          <StatRow label="Used" value={fmtBytes(stats?.mem?.used)} />
          <StatRow label="Free" value={fmtBytes(stats?.mem?.free)} />
          <StatRow label="Usage" value={`${ramPct.toFixed(1)}%`} />
        </div>

        {/* Disk */}
        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-yellow-400" />
            <p className="text-white/60 text-sm font-semibold">Disk (C:)</p>
          </div>
          <StatRow label="Total" value={fmtBytes(diskSize)} />
          <StatRow label="Used" value={fmtBytes(diskUsed)} />
          <StatRow label="Free" value={fmtBytes((stats?.disk?.[0]?.available) ?? 0)} />
          <StatRow label="Usage" value={`${diskPct.toFixed(1)}%`} />
        </div>
      </div>
    </div>
  )
}
