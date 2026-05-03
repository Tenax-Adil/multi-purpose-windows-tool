import { useState, useEffect, useRef } from 'react'
import { Wifi, Server, Plus, Trash2, Copy, Check, QrCode, Loader2, RefreshCw, Power, FolderOpen, Upload } from 'lucide-react'

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text) || window.electronAPI.writeClipboard(text)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy URL'}
    </button>
  )
}

export default function FileSender() {
  const [running, setRunning] = useState(false)
  const [serverInfo, setServerInfo] = useState(null) // {ip, port, url}
  const [files, setFiles] = useState([])
  const [shareDir, setShareDir] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newFiles, setNewFiles] = useState([]) // files received from other devices

  // On mount: get current status
  useEffect(() => {
    window.electronAPI.fileServerGetStatus().then(r => {
      if (r.running) {
        setRunning(true)
        setServerInfo({ ip: r.ip, port: r.port, url: `http://${r.ip}:${r.port}` })
        setFiles(r.files)
      }
    })

    // Listen for files uploaded by other devices
    window.electronAPI.onNewFileReceived?.((data) => {
      setNewFiles(prev => [data, ...prev])
      setFiles(prev => [...prev, data])
    })
  }, [])

  const handleSelectDir = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setShareDir(folder)
  }

  const handleStart = async () => {
    const dir = shareDir
    if (!dir) return
    setLoading(true)
    const result = await window.electronAPI.fileServerStart(dir)
    if (result.success) {
      setRunning(true)
      setServerInfo(result)
      setFiles([])
    }
    setLoading(false)
  }

  const handleStop = async () => {
    await window.electronAPI.fileServerStop()
    setRunning(false)
    setServerInfo(null)
    setFiles([])
    setNewFiles([])
  }

  const handleAddFiles = async () => {
    const selected = await window.electronAPI.selectFilesAny()
    if (!selected) return
    for (const f of selected) {
      const result = await window.electronAPI.fileServerAddFile(f)
      if (result.success) setFiles(result.files)
    }
  }

  const handleRemoveFile = async (name) => {
    const result = await window.electronAPI.fileServerRemoveFile(name)
    if (result.success) setFiles(result.files)
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Local WiFi File Sender</h2>
      <p className="text-white/40 text-sm mb-8">
        Share files with any device on your WiFi — phone, tablet, or other computer. No cables, no cloud.
      </p>

      {/* How it works */}
      <div className="rounded-xl p-5 mb-8 flex items-start gap-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <Wifi className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-indigo-300 text-sm font-semibold mb-1">How it works</p>
          <p className="text-white/40 text-sm">Start the server, then open the URL on any device connected to the same WiFi. They can download your shared files and upload files back to you — all without internet!</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Server Controls */}
        <div className="col-span-2 space-y-4">
          {/* Save dir */}
          <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Receive Folder</p>
            <button onClick={handleSelectDir}
              className="w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {shareDir
                ? <span className="text-white/60 font-mono text-xs truncate block">{shareDir}</span>
                : <span className="text-white/25 flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Select folder for received files...</span>
              }
            </button>
            <p className="text-white/20 text-xs">Files uploaded by other devices will be saved here.</p>
          </div>

          {/* Start/Stop */}
          {!running ? (
            <button
              onClick={handleStart}
              disabled={!shareDir || loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
              {loading ? 'Starting...' : 'Start Server'}
            </button>
          ) : (
            <button onClick={handleStop}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: 'rgba(248,113,113,0.9)' }}
            >
              <Power className="w-4 h-4" />
              Stop Server
            </button>
          )}

          {/* Server status card */}
          {running && serverInfo && (
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-green-400 text-sm font-semibold">Server Running</p>
              </div>

              <div>
                <p className="text-xs text-white/30 mb-1">Your IP Address</p>
                <p className="text-white/70 font-mono text-sm">{serverInfo.ip}</p>
              </div>

              <div>
                <p className="text-xs text-white/30 mb-2">URL to open on other devices</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-indigo-300 text-xs font-mono bg-black/30 px-2 py-1.5 rounded-lg truncate">
                    {serverInfo.url}
                  </code>
                  <CopyBtn text={serverInfo.url} />
                </div>
              </div>

              <div className="text-white/20 text-xs pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                Open this URL on your phone or other computer on the same WiFi network.
              </div>
            </div>
          )}

          {/* Received Files */}
          {newFiles.length > 0 && (
            <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <p className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-3">↑ Received from Devices</p>
              {newFiles.map((f, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-white/60 truncate">{f.name}</span>
                  <span className="text-white/30 flex-shrink-0 ml-2">{fmtSize(f.size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Shared Files */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Files Being Shared ({files.length})</p>
            {running && (
              <button onClick={handleAddFiles}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'rgba(165,180,252,1)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Files
              </button>
            )}
          </div>

          {!running ? (
            <div className="rounded-xl p-12 text-center" style={{ border: '2px dashed rgba(255,255,255,0.08)' }}>
              <Server className="w-10 h-10 text-white/15 mx-auto mb-3" />
              <p className="text-white/25 text-sm">Start the server to begin sharing files.</p>
              <p className="text-white/15 text-xs mt-1">Select a receive folder first.</p>
            </div>
          ) : files.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center cursor-pointer transition-all"
              style={{ border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
              onClick={handleAddFiles}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              <Upload className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Click to add files to share</p>
              <p className="text-white/15 text-xs mt-1">Other devices can then download them.</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-white/25">Downloadable at: <span className="text-indigo-400">{serverInfo?.url}</span></p>
              </div>
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 border-t group"
                  style={{ borderColor: 'rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-mono truncate">{f.name}</p>
                    <p className="text-white/25 text-xs">{fmtSize(f.size)}</p>
                  </div>
                  <button onClick={() => handleRemoveFile(f.name)}
                    className="ml-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
