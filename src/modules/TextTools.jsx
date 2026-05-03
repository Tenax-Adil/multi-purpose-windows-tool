import { useState } from 'react'
import { Hash, Link, Code, FileJson, Copy, Check } from 'lucide-react'

const tabs = [
  { id: 'base64', label: 'Base64', icon: Code },
  { id: 'url', label: 'URL Encode', icon: Link },
  { id: 'hash', label: 'Hash Generator', icon: Hash },
  { id: 'json', label: 'JSON Formatter', icon: FileJson },
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    window.electronAPI?.writeClipboard?.(text) || navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function TextArea({ value, onChange, placeholder, readOnly }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      className="w-full rounded-xl px-4 py-3 text-sm text-white/70 font-mono resize-none outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-white/20"
      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', minHeight: '120px' }}
    />
  )
}

function Base64Tab() {
  const [input, setInput] = useState('')
  const encoded = input ? btoa(unescape(encodeURIComponent(input))) : ''
  const [decInput, setDecInput] = useState('')
  const decoded = (() => { try { return decInput ? decodeURIComponent(escape(atob(decInput))) : '' } catch { return '⚠ Invalid Base64' } })()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between mb-2"><p className="text-xs text-white/30 uppercase tracking-wider">Plain Text → Base64</p></div>
          <TextArea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to encode..." />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2"><p className="text-xs text-white/30 uppercase tracking-wider">Encoded</p><CopyBtn text={encoded} /></div>
          <TextArea value={encoded} readOnly />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between mb-2"><p className="text-xs text-white/30 uppercase tracking-wider">Base64 → Plain Text</p></div>
          <TextArea value={decInput} onChange={e => setDecInput(e.target.value)} placeholder="Enter Base64 to decode..." />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2"><p className="text-xs text-white/30 uppercase tracking-wider">Decoded</p><CopyBtn text={decoded} /></div>
          <TextArea value={decoded} readOnly />
        </div>
      </div>
    </div>
  )
}

function UrlTab() {
  const [input, setInput] = useState('')
  const encoded = input ? encodeURIComponent(input) : ''
  const [decInput, setDecInput] = useState('')
  const decoded = (() => { try { return decInput ? decodeURIComponent(decInput) : '' } catch { return '⚠ Invalid URL encoding' } })()
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div><p className="text-xs text-white/30 uppercase tracking-wider mb-2">Input</p><TextArea value={input} onChange={e => setInput(e.target.value)} placeholder="Text to URL-encode..." /></div>
        <div><div className="flex justify-between items-center mb-2"><p className="text-xs text-white/30 uppercase tracking-wider">Encoded</p><CopyBtn text={encoded} /></div><TextArea value={encoded} readOnly /></div>
      </div>
      <div className="space-y-4">
        <div><p className="text-xs text-white/30 uppercase tracking-wider mb-2">Base64 Input</p><TextArea value={decInput} onChange={e => setDecInput(e.target.value)} placeholder="URL-encoded text to decode..." /></div>
        <div><div className="flex justify-between items-center mb-2"><p className="text-xs text-white/30 uppercase tracking-wider">Decoded</p><CopyBtn text={decoded} /></div><TextArea value={decoded} readOnly /></div>
      </div>
    </div>
  )
}

function HashTab() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState({})
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!input) return
    setLoading(true)
    const result = await window.electronAPI.generateHashes(input)
    if (result.success) setHashes(result.hashes)
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <TextArea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to hash..." />
      <button onClick={generate} disabled={!input || loading}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.7))' }}
      >
        Generate Hashes
      </button>
      {Object.entries(hashes).map(([algo, hash]) => (
        <div key={algo} className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">{algo}</p>
            <CopyBtn text={hash} />
          </div>
          <p className="text-white/50 font-mono text-xs break-all">{hash}</p>
        </div>
      ))}
    </div>
  )
}

function JsonTab() {
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState(2)
  const formatted = (() => { try { return input ? JSON.stringify(JSON.parse(input), null, indent) : '' } catch (e) { return `⚠ ${e.message}` } })()
  const isValid = (() => { try { JSON.parse(input); return true } catch { return false } })()
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-white/30 uppercase tracking-wider">Raw JSON</p>
          {input && <span className={`text-xs px-2 py-0.5 rounded-full ${isValid ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>{isValid ? 'Valid' : 'Invalid'}</span>}
        </div>
        <TextArea value={input} onChange={e => setInput(e.target.value)} placeholder='{"key": "value"}' />
        <div className="flex items-center gap-3 mt-3">
          <p className="text-xs text-white/30">Indent:</p>
          {[2, 4].map(n => (
            <button key={n} onClick={() => setIndent(n)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${indent === n ? 'text-white bg-indigo-500/30' : 'text-white/30 bg-white/5'}`}>{n}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2"><p className="text-xs text-white/30 uppercase tracking-wider">Formatted</p><CopyBtn text={formatted} /></div>
        <TextArea value={formatted} readOnly />
      </div>
    </div>
  )
}

const tabComponents = { base64: Base64Tab, url: UrlTab, hash: HashTab, json: JsonTab }

export default function TextTools() {
  const [activeTab, setActiveTab] = useState('base64')
  const ActiveTab = tabComponents[activeTab]

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Text Tools</h2>
      <p className="text-white/40 text-sm mb-8">Base64, URL encoding, hash generation, and JSON formatting.</p>

      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === t.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTab === t.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: activeTab === t.id ? 'rgba(165,180,252,1)' : 'rgba(255,255,255,0.4)'
              }}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>
      <ActiveTab />
    </div>
  )
}
