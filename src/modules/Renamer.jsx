import { useState, useEffect } from 'react'
import { FileTerminal, Play, FolderOpen, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function Renamer() {
  const [dir, setDir] = useState(null)
  const [files, setFiles] = useState([]) // {original, preview}
  const [loading, setLoading] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [logs, setLogs] = useState([])
  const [rules, setRules] = useState({
    findStr: '', replaceStr: '', useRegex: false,
    prefix: '', suffix: '',
    stripSpaces: false, stripUnderscores: false,
    sequential: false, toLowerCase: false, toUpperCase: false
  })

  const handleSelect = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) { setDir(folder); setLogs([]); loadFiles(folder) }
  }

  const loadFiles = async (folder) => {
    setLoading(true)
    const result = await window.electronAPI.listFiles(folder)
    if (result.success) {
      const previews = result.files.map(f => ({ original: f, preview: applyRules(f) }))
      setFiles(previews)
    }
    setLoading(false)
  }

  // Pure JS preview — mirrors the backend logic
  const applyRules = (filename) => {
    const lastDot = filename.lastIndexOf('.')
    const ext = lastDot > 0 ? filename.slice(lastDot) : ''
    let base = lastDot > 0 ? filename.slice(0, lastDot) : filename

    if (rules.stripSpaces) base = base.replace(/\s+/g, '')
    if (rules.stripUnderscores) base = base.replace(/_/g, '')
    if (rules.toLowerCase) base = base.toLowerCase()
    if (rules.toUpperCase) base = base.toUpperCase()

    if (rules.findStr) {
      try {
        const pattern = rules.useRegex ? new RegExp(rules.findStr, 'g') : rules.findStr
        base = rules.useRegex
          ? base.replace(pattern, rules.replaceStr || '')
          : base.split(rules.findStr).join(rules.replaceStr || '')
      } catch {}
    }

    if (rules.prefix) base = rules.prefix + base
    if (rules.suffix) base = base + rules.suffix

    return base + ext
  }

  // Re-calculate preview whenever rules change
  useEffect(() => {
    if (files.length === 0) return
    let counter = 1
    const updated = files.map(f => {
      const lastDot = f.original.lastIndexOf('.')
      const ext = lastDot > 0 ? f.original.slice(lastDot) : ''
      let base = lastDot > 0 ? f.original.slice(0, lastDot) : f.original

      if (rules.stripSpaces) base = base.replace(/\s+/g, '')
      if (rules.stripUnderscores) base = base.replace(/_/g, '')
      if (rules.toLowerCase) base = base.toLowerCase()
      if (rules.toUpperCase) base = base.toUpperCase()

      if (rules.findStr) {
        try {
          const pattern = rules.useRegex ? new RegExp(rules.findStr, 'g') : rules.findStr
          base = rules.useRegex
            ? base.replace(pattern, rules.replaceStr || '')
            : base.split(rules.findStr).join(rules.replaceStr || '')
        } catch {}
      }

      if (rules.prefix) base = rules.prefix + base
      if (rules.suffix) base = base + rules.suffix
      if (rules.sequential) { base = base + '_' + String(counter).padStart(3, '0'); counter++ }

      return { original: f.original, preview: base + ext }
    })
    setFiles(updated)
  }, [rules])

  const handleRename = async () => {
    if (!dir) return
    setRenaming(true)
    const result = await window.electronAPI.renameFiles(dir, rules)
    if (result.success) {
      setLogs(result.logs.length ? result.logs : ['No files needed renaming.'])
      loadFiles(dir)
    } else {
      setLogs([`Error: ${result.error}`])
    }
    setRenaming(false)
  }

  const setRule = (key, val) => setRules(prev => ({ ...prev, [key]: val }))

  const changedCount = files.filter(f => f.original !== f.preview).length

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Bulk File Renamer</h2>
      <p className="text-white/40 text-sm mb-8">Configure rules, preview live changes, then execute with one click.</p>

      {!dir ? (
        <div
          onClick={handleSelect}
          className="rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
          style={{ border: '2px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <FileTerminal className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-white/80 font-semibold mb-1">Select Directory</h3>
          <p className="text-white/30 text-sm">Choose a folder to batch rename its files</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-6">
          {/* Rules Panel */}
          <div className="col-span-2 space-y-5">
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Find & Replace</p>
              </div>
              <input
                value={rules.findStr} onChange={e => setRule('findStr', e.target.value)}
                placeholder="Find text or regex..."
                className="w-full rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-indigo-500"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <input
                value={rules.replaceStr} onChange={e => setRule('replaceStr', e.target.value)}
                placeholder="Replace with..."
                className="w-full rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-indigo-500"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <CheckboxRow label="Use RegEx" checked={rules.useRegex} onChange={v => setRule('useRegex', v)} />
            </div>

            <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Prefix & Suffix</p>
              <div className="grid grid-cols-2 gap-3">
                <input value={rules.prefix} onChange={e => setRule('prefix', e.target.value)} placeholder="Prefix..."
                  className="w-full rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }} />
                <input value={rules.suffix} onChange={e => setRule('suffix', e.target.value)} placeholder="Suffix..."
                  className="w-full rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Cleanup Options</p>
              <CheckboxRow label="Strip spaces" checked={rules.stripSpaces} onChange={v => setRule('stripSpaces', v)} />
              <CheckboxRow label="Strip underscores" checked={rules.stripUnderscores} onChange={v => setRule('stripUnderscores', v)} />
              <CheckboxRow label="To LOWERCASE" checked={rules.toLowerCase} onChange={v => setRule('toLowerCase', v)} />
              <CheckboxRow label="To UPPERCASE" checked={rules.toUpperCase} onChange={v => setRule('toUpperCase', v)} />
              <CheckboxRow label="Add _001 numbering" checked={rules.sequential} onChange={v => setRule('sequential', v)} />
            </div>

            <div className="flex gap-2">
              <button onClick={handleSelect} className="flex-1 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors" style={{ background: 'rgba(255,255,255,0.04)' }}>
                Change Folder
              </button>
              <button onClick={handleRename} disabled={renaming || changedCount === 0}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}
              >
                {renaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {renaming ? 'Renaming...' : `Rename ${changedCount}`}
              </button>
            </div>
          </div>

          {/* Live Preview Table */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/30 uppercase tracking-wider">{loading ? 'Loading files...' : `${files.length} files · ${changedCount} will change`}</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider w-8">#</th>
                    <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Current Name</th>
                    <th className="text-left px-4 py-3 text-white/30 font-semibold uppercase tracking-wider">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {files.slice(0, 60).map((f, i) => {
                    const changed = f.original !== f.preview
                    return (
                      <tr key={i} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        <td className="px-4 py-2.5 text-white/20">{i + 1}</td>
                        <td className="px-4 py-2.5 text-white/50 font-mono truncate max-w-[160px]">{f.original}</td>
                        <td className="px-4 py-2.5 font-mono truncate max-w-[160px]">
                          {changed
                            ? <span className="text-indigo-400">{f.preview}</span>
                            : <span className="text-white/20">{f.preview}</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                  {files.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-white/20">No files found in directory</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {logs.length > 0 && (
              <div className="mt-4 rounded-xl p-4 font-mono text-xs space-y-1 max-h-36 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-blue-400">›</span>
                    <span className="text-white/40">{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: checked ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.06)', border: `1px solid ${checked ? 'rgba(99,102,241,1)' : 'rgba(255,255,255,0.12)'}` }}
      >
        {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">{label}</span>
    </label>
  )
}
