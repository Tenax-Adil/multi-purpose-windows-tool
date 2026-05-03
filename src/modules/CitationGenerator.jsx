import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const FORMATS = ['APA', 'MLA', 'Chicago']
const TYPES   = ['Book', 'Website', 'Journal Article']

function formatCitation(fmt, type, f) {
  const au = f.author || 'Author, A.'
  const yr = f.year   || 'n.d.'
  const ti = f.title  || 'Untitled'
  const pu = f.publisher || ''
  const jo = f.journal  || ''
  const vo = f.volume   || ''
  const is = f.issue    || ''
  const pg = f.pages    || ''
  const ur = f.url      || ''
  const si = f.site     || ''

  if (fmt === 'APA') {
    if (type === 'Book')           return `${au} (${yr}). *${ti}*. ${pu}.`
    if (type === 'Website')        return `${au} (${yr}). ${ti}. ${si}. ${ur}`
    if (type === 'Journal Article') return `${au} (${yr}). ${ti}. *${jo}*, *${vo}*(${is}), ${pg}.`
  }
  if (fmt === 'MLA') {
    if (type === 'Book')           return `${au} *${ti}*. ${pu}, ${yr}.`
    if (type === 'Website')        return `${au} "${ti}." *${si}*, ${yr}, ${ur}.`
    if (type === 'Journal Article') return `${au} "${ti}." *${jo}* ${vo}.${is} (${yr}): ${pg}.`
  }
  if (fmt === 'Chicago') {
    if (type === 'Book')           return `${au} *${ti}*. ${pu}, ${yr}.`
    if (type === 'Website')        return `${au} "${ti}." ${si}. ${yr}. ${ur}.`
    if (type === 'Journal Article') return `${au} "${ti}." *${jo}* ${vo}, no. ${is} (${yr}): ${pg}.`
  }
  return ''
}

function Field({ label, value, onChange, placeholder, span }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-xs text-white/30 mb-1.5">{label}</p>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input-base text-sm" />
    </div>
  )
}

export default function CitationGenerator() {
  const [fmt, setFmt]   = useState('APA')
  const [type, setType] = useState('Book')
  const [f, setF]       = useState({ author:'', year:'', title:'', publisher:'', journal:'', volume:'', issue:'', pages:'', url:'', site:'' })
  const [copied, setCopied] = useState(false)
  const set = (k) => (v) => setF(prev => ({ ...prev, [k]: v }))

  const citation = formatCitation(fmt, type, f)

  const copy = () => {
    navigator.clipboard?.writeText(citation) || window.electronAPI?.writeClipboard?.(citation)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Citation Generator</h2>
      <p className="text-white/40 text-sm mb-6">Generate APA, MLA, and Chicago citations for books, websites, and journal articles.</p>

      {/* Format & Type */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {FORMATS.map(f => (
            <button key={f} onClick={() => setFmt(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: fmt===f?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.04)',
                border:`1px solid ${fmt===f?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.08)'}`,
                color: fmt===f?'rgba(165,180,252,1)':'rgba(255,255,255,0.4)' }}>{f}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: type===t?'rgba(52,211,153,0.15)':'rgba(255,255,255,0.04)',
                border:`1px solid ${type===t?'rgba(52,211,153,0.4)':'rgba(255,255,255,0.08)'}`,
                color: type===t?'rgba(52,211,153,1)':'rgba(255,255,255,0.4)' }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="glass-card p-5 mb-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Author(s)"  value={f.author}    onChange={set('author')}    placeholder="Last, First M." />
          <Field label="Year"       value={f.year}      onChange={set('year')}      placeholder="2024" />
          <Field label="Title"      value={f.title}     onChange={set('title')}     placeholder="Title of work" span />
          {type === 'Book' && <><Field label="Publisher" value={f.publisher} onChange={set('publisher')} placeholder="Publisher Name" span /></>}
          {type === 'Website' && <>
            <Field label="Website Name" value={f.site} onChange={set('site')} placeholder="Site Name" />
            <Field label="URL" value={f.url} onChange={set('url')} placeholder="https://..." />
          </>}
          {type === 'Journal Article' && <>
            <Field label="Journal Name" value={f.journal} onChange={set('journal')} placeholder="Journal of…" span />
            <Field label="Volume" value={f.volume} onChange={set('volume')} placeholder="12" />
            <Field label="Issue"  value={f.issue}  onChange={set('issue')}  placeholder="3" />
            <Field label="Pages"  value={f.pages}  onChange={set('pages')}  placeholder="45–67" />
          </>}
        </div>
      </div>

      {/* Result */}
      {citation && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">{fmt} · {type}</p>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
              {copied ? <><Check className="w-3 h-3 text-green-400" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
            </button>
          </div>
          <p className="text-white/70 text-sm leading-relaxed italic">{citation}</p>
        </div>
      )}
    </div>
  )
}
