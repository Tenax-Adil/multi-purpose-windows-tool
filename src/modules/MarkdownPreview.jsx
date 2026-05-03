import { useState, useEffect } from 'react'
import { marked } from 'marked'
import { FileText, Copy, Check } from 'lucide-react'

marked.setOptions({ gfm: true, breaks: true })

const SAMPLE = `# Welcome to Markdown Preview

## Features
- **Bold text** and *italic text*
- \`inline code\` and code blocks
- [Links](https://example.com) and images
- Tables and blockquotes

## Code Block
\`\`\`javascript
const hello = () => console.log("Hello, World!")
hello()
\`\`\`

## Table
| Name | Type | Size |
|------|------|------|
| file.txt | Text | 4 KB |
| photo.png | Image | 2 MB |

> This is a blockquote. It renders beautifully!
`

export default function MarkdownPreview() {
  const [input, setInput] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)

  const html = marked(input)

  const copy = () => {
    window.electronAPI?.writeClipboard?.(input) || navigator.clipboard?.writeText(input)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Markdown Preview</h2>
      <p className="text-white/40 text-sm mb-6">Type markdown on the left, see the rendered output on the right — live.</p>

      <div className="grid grid-cols-2 gap-4" style={{ height: 580 }}>
        {/* Editor */}
        <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-white/30" /><p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Markdown Source</p></div>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
              {copied ? <><Check className="w-3 h-3 text-green-400" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
            </button>
          </div>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 resize-none p-4 text-sm text-white/60 font-mono bg-transparent outline-none leading-relaxed"
            style={{ background: 'rgba(0,0,0,0.3)' }} />
          <div className="px-4 py-1.5 text-xs text-white/20" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {input.length} chars · {input.split('\n').length} lines
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Preview</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>

      <style>{`
        .markdown-body { color: rgba(226,232,240,0.85); font-size: 14px; line-height: 1.7; }
        .markdown-body h1,.markdown-body h2,.markdown-body h3 { color: white; font-weight: 700; margin: 1.2em 0 0.5em; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.3em; }
        .markdown-body h1 { font-size: 1.6em; }
        .markdown-body h2 { font-size: 1.3em; }
        .markdown-body h3 { font-size: 1.1em; }
        .markdown-body p { margin: 0.75em 0; }
        .markdown-body code { background: rgba(99,102,241,0.15); color: #a5b4fc; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-family: 'JetBrains Mono', monospace; }
        .markdown-body pre { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; overflow-x: auto; margin: 1em 0; }
        .markdown-body pre code { background: transparent; padding: 0; color: rgba(165,180,252,0.9); }
        .markdown-body blockquote { border-left: 3px solid rgba(99,102,241,0.6); margin: 1em 0; padding: 8px 16px; background: rgba(99,102,241,0.08); border-radius: 0 8px 8px 0; color: rgba(255,255,255,0.5); }
        .markdown-body a { color: rgba(129,140,248,1); text-decoration: none; }
        .markdown-body a:hover { text-decoration: underline; }
        .markdown-body ul,.markdown-body ol { padding-left: 1.5em; margin: 0.75em 0; }
        .markdown-body li { margin: 0.25em 0; }
        .markdown-body table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        .markdown-body th { background: rgba(99,102,241,0.15); color: rgba(165,180,252,1); padding: 8px 12px; text-align: left; font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.05em; }
        .markdown-body td { padding: 8px 12px; border-top: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); font-size: 0.9em; }
        .markdown-body strong { color: white; }
        .markdown-body em { color: rgba(255,255,255,0.7); }
        .markdown-body hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5em 0; }
      `}</style>
    </div>
  )
}
