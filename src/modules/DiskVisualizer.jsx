import { useState, useEffect, useRef } from 'react'
import { HardDrive, RefreshCw, Loader2, Folder } from 'lucide-react'

function fmtSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + ' MB'
  return (bytes / 1024 ** 3).toFixed(2) + ' GB'
}

const COLORS = [
  'rgba(99,102,241,0.8)', 'rgba(168,85,247,0.8)', 'rgba(236,72,153,0.8)',
  'rgba(245,158,11,0.8)', 'rgba(20,184,166,0.8)', 'rgba(99,210,72,0.8)',
  'rgba(248,113,113,0.8)', 'rgba(96,165,250,0.8)',
]

export default function DiskVisualizer() {
  const [disks, setDisks] = useState([])
  const [folderDir, setFolderDir] = useState(null)
  const [folderData, setFolderData] = useState([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  useEffect(() => { fetchDisks() }, [])

  const fetchDisks = async () => {
    setLoading(true)
    const result = await window.electronAPI.getSystemStats()
    if (result.success) setDisks(result.data.disk || [])
    setLoading(false)
  }

  const handleScanFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (!folder) return
    setFolderDir(folder)
    setScanning(true)
    const result = await window.electronAPI.getDiskUsageByFolder(folder)
    if (result.success) setFolderData(result.items)
    setScanning(false)
  }

  const totalFolderSize = folderData.reduce((a, i) => a + i.size, 0)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Disk Usage Visualizer</h2>
          <p className="text-white/40 text-sm">View drive usage and scan folder contents by size.</p>
        </div>
        <button onClick={fetchDisks} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <RefreshCw className={`w-4 h-4 text-white/40 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Drive Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {disks.filter(d => d.size > 0).map((disk, i) => {
          const pct = (disk.used / disk.size) * 100
          const color = pct > 85 ? 'rgba(248,113,113,0.7)' : pct > 60 ? 'rgba(245,158,11,0.7)' : 'rgba(99,102,241,0.7)'
          return (
            <div key={i} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="w-5 h-5 text-white/40" />
                <div className="flex-1">
                  <p className="text-white/70 font-semibold text-sm">{disk.fs || `Drive ${i + 1}`}</p>
                  <p className="text-white/30 text-xs">{disk.type}</p>
                </div>
                <span className={`text-sm font-bold ${pct > 85 ? 'text-red-400' : pct > 60 ? 'text-yellow-400' : 'text-indigo-400'}`}>
                  {pct.toFixed(1)}%
                </span>
              </div>
              {/* Bar */}
              <div className="h-2 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
              </div>
              <div className="flex justify-between text-xs text-white/30">
                <span>Used: {fmtSize(disk.used)}</span>
                <span>Free: {fmtSize(disk.available)}</span>
                <span>Total: {fmtSize(disk.size)}</span>
              </div>
            </div>
          )
        })}
        {disks.length === 0 && !loading && (
          <div className="col-span-2 text-center py-8 text-white/20">
            <HardDrive className="w-8 h-8 mx-auto mb-2" />
            <p>No drives detected</p>
          </div>
        )}
      </div>

      {/* Folder Drill-down */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/70 font-semibold text-sm mb-0.5">Folder Size Breakdown</p>
            <p className="text-white/30 text-xs">Scan any folder to see what's taking space</p>
          </div>
          <button onClick={handleScanFolder} disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.7), rgba(168,85,247,0.6))' }}>
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Folder className="w-4 h-4" />}
            {scanning ? 'Scanning...' : 'Scan Folder'}
          </button>
        </div>

        {folderDir && <p className="text-white/30 text-xs font-mono mb-4">{folderDir}</p>}

        {scanning && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
          </div>
        )}

        {folderData.length > 0 && !scanning && (
          <div className="space-y-2">
            {/* Stacked bar */}
            <div className="h-3 rounded-full overflow-hidden flex mb-5">
              {folderData.slice(0, 8).map((item, i) => (
                <div key={i} className="h-full transition-all"
                  style={{ width: `${(item.size / totalFolderSize) * 100}%`, background: COLORS[i % COLORS.length] }} />
              ))}
            </div>
            {folderData.map((item, i) => {
              const pct = (item.size / totalFolderSize) * 100
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1 text-white/60 text-sm truncate font-mono">{item.name}</span>
                  <div className="w-32 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="text-white/40 text-xs w-20 text-right flex-shrink-0">{fmtSize(item.size)}</span>
                  <span className="text-white/20 text-xs w-12 text-right flex-shrink-0">{pct.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        )}

        {!folderDir && !scanning && (
          <div className="text-center py-8 text-white/20">
            <Folder className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Click "Scan Folder" to see what's taking up space</p>
          </div>
        )}
      </div>
    </div>
  )
}
