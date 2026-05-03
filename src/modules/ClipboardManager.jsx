import { useState, useEffect } from 'react'
import { ClipboardList, Pin, Trash2, Copy, RefreshCw } from 'lucide-react'

export default function ClipboardManager() {
  const [history, setHistory] = useState([])
  const [pinned, setPinned] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = async () => {
    setLoading(true)
    const result = await window.electronAPI.getClipboardHistory()
    if (result.success) setHistory(result.history)
    setLoading(false)
  }

  useEffect(() => {
    fetchHistory()
    const id = setInterval(async () => {
      const result = await window.electronAPI.getClipboardHistory()
      if (result.success) setHistory(result.history)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const copyToClipboard = async (text) => {
    await window.electronAPI.writeClipboard(text)
  }

  const togglePin = (item) => {
    setPinned(prev =>
      prev.includes(item) ? prev.filter(p => p !== item) : [item, ...prev]
    )
  }

  const timeAgo = (ts) => {
    const sec = Math.floor((Date.now() - ts) / 1000)
    if (sec < 60) return `${sec}s ago`
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
    return `${Math.floor(sec / 3600)}h ago`
  }

  const ClipItem = ({ item, isPinned }) => (
    <div
      className="group flex gap-3 items-start p-3 rounded-xl transition-all"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-white/60 text-sm font-mono truncate">{item.text}</p>
        <p className="text-white/20 text-xs mt-0.5">{timeAgo(item.timestamp)} · {item.text.length} chars</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => copyToClipboard(item.text)} title="Copy" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => togglePin(item.text)} title="Pin" className={`p-1.5 rounded-lg transition-all ${isPinned ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/40 hover:text-yellow-400 hover:bg-white/10'}`}>
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Clipboard Manager</h2>
          <p className="text-white/40 text-sm">Automatically tracks everything you copy. Click to re-paste.</p>
        </div>
        <button onClick={fetchHistory} className="p-2 rounded-lg text-white/30 hover:text-white/60 transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-3.5 h-3.5 text-yellow-400" />
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Pinned</p>
          </div>
          <div className="space-y-2">
            {pinned.map((text, i) => (
              <ClipItem key={i} item={{ text, timestamp: Date.now() }} isPinned />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-3.5 h-3.5 text-white/30" />
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Recent ({history.length})</p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16 text-white/20">
            <ClipboardList className="w-10 h-10 mx-auto mb-3" />
            <p>Copy something to see it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item, i) => (
              <ClipItem key={i} item={item} isPinned={pinned.includes(item.text)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
