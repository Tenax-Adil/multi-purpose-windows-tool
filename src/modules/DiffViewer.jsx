import { useState } from 'react'

function diffLines(a, b) {
  const linesA = a.split('\n'), linesB = b.split('\n')
  const max = Math.max(linesA.length, linesB.length)
  const result = []
  for (let i = 0; i < max; i++) {
    const la = linesA[i] ?? null, lb = linesB[i] ?? null
    if (la === lb) result.push({ type: 'same', left: la, right: lb, line: i + 1 })
    else result.push({ type: 'diff', left: la, right: lb, line: i + 1 })
  }
  return result
}

export default function DiffViewer() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [showDiff, setShowDiff] = useState(false)

  const diff = diffLines(left, right)
  const changed = diff.filter(d => d.type === 'diff').length
  const same = diff.filter(d => d.type === 'same').length

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Diff Viewer</h2>
      <p className="text-white/40 text-sm mb-6">Side-by-side text comparison</p>

      {!showDiff ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-white/30 block mb-1">Original</label>
              <textarea value={left} onChange={e => setLeft(e.target.value)}
                className="input-base font-mono text-xs" rows={12} style={{ resize: 'vertical' }}
                placeholder="Paste original text…" />
            </div>
            <div>
              <label className="text-xs text-white/30 block mb-1">Modified</label>
              <textarea value={right} onChange={e => setRight(e.target.value)}
                className="input-base font-mono text-xs" rows={12} style={{ resize: 'vertical' }}
                placeholder="Paste modified text…" />
            </div>
          </div>
          <button onClick={() => setShowDiff(true)} disabled={!left.trim() && !right.trim()}
            className="btn-primary px-6 py-2 text-sm">Compare</button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setShowDiff(false)} className="btn-ghost px-4 py-1.5 text-xs">← Edit</button>
            <span className="text-xs text-white/30">{diff.length} lines</span>
            <span className="tag-green tag text-[10px]">{same} same</span>
            <span className="tag-red tag text-[10px]">{changed} changed</span>
          </div>
          <div className="glass-card overflow-auto max-h-[500px]" style={{ fontSize: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th style={{ width: 30, padding: '6px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>#</th>
                  <th style={{ padding: '6px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>Original</th>
                  <th style={{ padding: '6px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>Modified</th>
                </tr>
              </thead>
              <tbody>
                {diff.map((d, i) => (
                  <tr key={i} style={{ background: d.type === 'diff' ? 'rgba(239,68,68,0.04)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '3px 8px', textAlign: 'right', color: 'rgba(255,255,255,0.12)', fontFamily: 'monospace', fontSize: 10 }}>{d.line}</td>
                    <td style={{ padding: '3px 12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: d.type === 'diff' ? '#fca5a5' : 'rgba(255,255,255,0.4)', background: d.type === 'diff' && d.left !== null ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
                      {d.left ?? ''}
                    </td>
                    <td style={{ padding: '3px 12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: d.type === 'diff' ? '#6ee7b7' : 'rgba(255,255,255,0.4)', background: d.type === 'diff' && d.right !== null ? 'rgba(16,185,129,0.06)' : 'transparent' }}>
                      {d.right ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
