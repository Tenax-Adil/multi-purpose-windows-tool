import { useState, useEffect } from 'react'
import { Type, Loader2, Search } from 'lucide-react'

export default function FontPreview() {
  const [fonts, setFonts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [previewText, setPreviewText] = useState('The quick brown fox')
  const [fontSize, setFontSize] = useState(18)

  useEffect(() => {
    window.electronAPI.listFonts().then(result => {
      if (result.success) setFonts(result.fonts)
      setLoading(false)
    })
  }, [])

  const filtered = fonts.filter(f => f.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Font Preview</h2>
      <p className="text-white/40 text-sm mb-8">Browse all {fonts.length} fonts installed on your system.</p>

      {/* Controls */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search fonts..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/70 outline-none"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <input
          value={previewText} onChange={e => setPreviewText(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm text-white/70 outline-none w-64"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
          placeholder="Preview text..."
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">Size</span>
          <input type="range" min="12" max="48" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-20 accent-indigo-500" />
          <span className="text-xs text-white/40 w-6">{fontSize}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-white/20 mb-3">{filtered.length} fonts</p>
          {filtered.map(font => (
            <div key={font} className="flex items-center gap-6 px-5 py-4 rounded-xl hover:bg-white/5 transition-all group"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-36 flex-shrink-0">
                <p className="text-white/30 text-xs font-mono truncate">{font}</p>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p
                  className="text-white/70 truncate"
                  style={{ fontFamily: `"${font}", sans-serif`, fontSize: `${fontSize}px`, lineHeight: 1.4 }}
                >
                  {previewText || 'The quick brown fox'}
                </p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/20">No fonts match "{search}"</div>
          )}
        </div>
      )}
    </div>
  )
}
