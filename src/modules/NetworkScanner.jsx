import { useState, useEffect } from 'react'
import { Wifi, Loader2, RefreshCw, Monitor, Globe } from 'lucide-react'

export default function NetworkScanner() {
  const [devices, setDevices] = useState([])
  const [interfaces, setInterfaces] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNetwork = async () => {
    setLoading(true)
    const result = await window.electronAPI.scanNetwork()
    if (result.success) {
      setDevices(result.devices)
      setInterfaces(result.interfaces)
    }
    setLoading(false)
  }

  useEffect(() => { fetchNetwork() }, [])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Network Scanner</h2>
          <p className="text-white/40 text-sm">View network interfaces and devices on your local network.</p>
        </div>
        <button onClick={fetchNetwork} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rescan
        </button>
      </div>

      {/* Network Interfaces */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-indigo-400" />
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Network Interfaces</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {interfaces.filter(i => i.ip4).map((iface, idx) => (
            <div key={idx} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${iface.operstate === 'up' ? 'bg-green-400' : 'bg-red-400'}`} />
                <p className="text-white/70 font-semibold text-sm">{iface.iface}</p>
                <span className="text-xs text-white/30 ml-auto">{iface.type}</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <p><span className="text-white/30">IPv4: </span><span className="text-white/60">{iface.ip4 || '—'}</span></p>
                <p><span className="text-white/30">MAC: </span><span className="text-white/60">{iface.mac || '—'}</span></p>
                <p><span className="text-white/30">Speed: </span><span className="text-white/60">{iface.speed ? iface.speed + ' Mbps' : '—'}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Devices from ARP */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Monitor className="w-4 h-4 text-purple-400" />
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Local Devices ({devices.length})</p>
        </div>

        {loading && devices.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">IP Address</th>
                  <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">MAC Address</th>
                  <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td className="px-4 py-3 text-indigo-400 font-mono">{d.ip}</td>
                    <td className="px-4 py-3 text-white/50 font-mono">{d.mac}</td>
                    <td className="px-4 py-3 text-white/30">{d.type}</td>
                  </tr>
                ))}
                {devices.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-white/20">No devices found. Click Rescan to refresh.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
