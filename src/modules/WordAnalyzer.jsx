import { useState } from 'react'

function analyze(text) {
  if (!text.trim()) return null
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chars  = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
  const avgSyllables = words.reduce((acc, w) => acc + syllables(w), 0) / Math.max(words.length, 1)
  // Flesch Reading Ease
  const fre = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllables
  const clampedFre = Math.min(100, Math.max(0, fre))
  const freLabel = clampedFre >= 90 ? 'Very Easy' : clampedFre >= 80 ? 'Easy' : clampedFre >= 70 ? 'Fairly Easy' : clampedFre >= 60 ? 'Standard' : clampedFre >= 50 ? 'Fairly Difficult' : clampedFre >= 30 ? 'Difficult' : 'Very Difficult'
  const freColor = clampedFre >= 70 ? 'rgb(52,211,153)' : clampedFre >= 50 ? 'rgb(251,191,36)' : 'rgb(248,113,113)'
  // Top words
  const freq = {}
  words.forEach(w => { const k = w.toLowerCase().replace(/[^a-z]/g,''); if (k.length > 3) freq[k] = (freq[k]||0)+1 })
  const topWords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8)
  return {
    words: words.length, chars, charsNoSpace, sentences: sentences.length,
    paragraphs: paragraphs.length, readingTime: Math.ceil(words.length / 200),
    speakingTime: Math.ceil(words.length / 130), avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
    fre: clampedFre.toFixed(0), freLabel, freColor, topWords
  }
}

function syllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g,'')
  if (!word) return 0
  let count = word.match(/[aeiouy]+/g)?.length || 1
  if (word.endsWith('e') && count > 1) count--
  return Math.max(1, count)
}

function Stat({ label, value, sub }) {
  return (
    <div className="glass-card p-4 text-center">
      <p className="text-2xl font-bold text-white/90">{value}</p>
      <p className="text-white/50 text-xs font-medium mt-0.5">{label}</p>
      {sub && <p className="text-white/25 text-[10px] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function WordAnalyzer() {
  const [text, setText] = useState('')
  const stats = analyze(text)

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Word & Readability Analyzer</h2>
      <p className="text-white/40 text-sm mb-6">Paste your essay or document to get detailed writing statistics.</p>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Paste your text here…"
            className="w-full rounded-xl p-4 text-sm text-white/70 resize-none outline-none leading-relaxed"
            style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', minHeight:340 }} />
          <p className="text-white/20 text-xs mt-1 text-right">{text.length} characters</p>
        </div>

        <div className="space-y-3">
          {stats ? <>
            <Stat label="Words"      value={stats.words} />
            <Stat label="Characters" value={stats.chars}  sub={`${stats.charsNoSpace} without spaces`} />
            <Stat label="Sentences"  value={stats.sentences} sub={`~${stats.avgWordsPerSentence} words each`} />
            <Stat label="Paragraphs" value={stats.paragraphs} />
            <Stat label="Reading Time" value={`${stats.readingTime}m`} sub="at 200 WPM" />
            <Stat label="Speaking Time" value={`${stats.speakingTime}m`} sub="at 130 WPM" />
          </> : (
            <div className="glass-card p-6 text-center text-white/20">
              <p className="text-sm">Paste text to see stats</p>
            </div>
          )}
        </div>
      </div>

      {stats && <>
        {/* Flesch score */}
        <div className="glass-card p-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Flesch Reading Ease</p>
            <span className="text-sm font-bold" style={{ color: stats.freColor }}>{stats.freLabel} ({stats.fre}/100)</span>
          </div>
          <div className="h-2 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width:`${stats.fre}%`, background: stats.freColor }} />
          </div>
          <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
            <span>Very Difficult</span><span>Standard</span><span>Very Easy</span>
          </div>
        </div>

        {/* Top words */}
        {stats.topWords.length > 0 && (
          <div className="glass-card p-5 mt-4">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">Most Frequent Words</p>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([word, count]) => (
                <span key={word} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                  style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)' }}>
                  <span className="text-white/60">{word}</span>
                  <span className="text-indigo-400 font-bold">{count}×</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </>}
    </div>
  )
}
