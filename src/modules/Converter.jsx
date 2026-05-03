import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Upload, FolderOpen, Loader2, Image, FileText, FilePlus, X, CheckCircle2 } from 'lucide-react'
import * as pdfjs from 'pdfjs-dist'

// Configure worker for Vite/Electron
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif']
const PDF_EXTS   = ['.pdf']
const FORMATS    = ['jpeg', 'png', 'bmp', 'tiff', 'gif']
const JIMP_MIME  = { jpeg: 'image/jpeg', png: 'image/png', bmp: 'image/bmp', tiff: 'image/tiff', gif: 'image/gif' }

export default function Converter() {
  const [mode, setMode] = useState('image')
  const [files, setFiles] = useState([])
  const [outputFormat, setOutputFormat] = useState('png')
  const [outputDir, setOutputDir] = useState(null)
  const [quality, setQuality] = useState(90)
  const [resize, setResize] = useState({ width: '', height: '' })
  const [pdfAction, setPdfAction] = useState('toImages')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [logs, setLogs] = useState([])
  const [converting, setConverting] = useState(false)

  const handleFileSelect = async () => {
    const exts = mode === 'image' ? IMAGE_EXTS : PDF_EXTS
    const result = await window.electronAPI.selectFiles(exts)
    if (result) addFiles(result)
  }

  const addFiles = (paths) => {
    const validExts = mode === 'image' ? IMAGE_EXTS : PDF_EXTS
    const filtered = paths.filter(p => {
      const ext = '.' + p.split('.').pop().toLowerCase()
      return validExts.includes(ext)
    })
    setFiles(prev => [...new Set([...prev, ...filtered])])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const paths = Array.from(e.dataTransfer.files).map(f => f.path)
    addFiles(paths)
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
  }

  const handleSelectOutput = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setOutputDir(folder)
  }

  // ── IMAGE CONVERSION ──────────────────────────────────────────
  const convertImages = async () => {
    setConverting(true); setLogs([]); setProgress({ current: 0, total: files.length })
    for (let i = 0; i < files.length; i++) {
      const result = await window.electronAPI.convertImage({
        input: files[i], format: outputFormat,
        quality, outputDir: outputDir || null, resize
      })
      setLogs(prev => [...prev, result.success
        ? `✓ ${files[i].split('\\').pop()} → ${result.output.split('\\').pop()}`
        : `✗ ${files[i].split('\\').pop()}: ${result.error}`
      ])
      setProgress({ current: i + 1, total: files.length })
    }
    setConverting(false)
  }

  // ── PDF → IMAGES (renderer-side using pdfjs-dist) ─────────────
  const pdfToImages = async (pdfPath) => {
    const outDir = outputDir || pdfPath.substring(0, pdfPath.lastIndexOf('\\'))
    const baseName = pdfPath.split('\\').pop().replace('.pdf', '')

    // Read file buffer from main via IPC
    const { data: base64 } = await window.electronAPI.readFileBase64(pdfPath)
    const uint8 = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

    const pdf = await pdfjs.getDocument({ data: uint8 }).promise
    const total = pdf.numPages
    const saved = []

    for (let pageNum = 1; pageNum <= total; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise

      // Export as PNG blob → base64 → save via IPC
      const dataUrl = canvas.toDataURL('image/png')
      const imgBase64 = dataUrl.split(',')[1]
      const result = await window.electronAPI.saveBase64File({
        base64: imgBase64,
        outputPath: `${outDir}\\${baseName}_page_${String(pageNum).padStart(3, '0')}.png`
      })
      if (result.success) saved.push(result.path)
      setProgress(p => ({ ...p, current: p.current + 1 }))
    }
    return saved
  }

  // ── IMAGES → PDF (merge via pdf-lib in main) ──────────────────
  const imagesToPdf = async () => {
    const outDir = outputDir || files[0].substring(0, files[0].lastIndexOf('\\'))
    const result = await window.electronAPI.imagesToPdf({ files, outputDir: outDir })
    if (result.success) setLogs(prev => [...prev, `✓ Created: ${result.output.split('\\').pop()}`])
    else setLogs(prev => [...prev, `✗ Error: ${result.error}`])
  }

  // ── PDF SPLIT (each page → separate PDF) ──────────────────────
  const splitPdf = async (pdfPath) => {
    const result = await window.electronAPI.splitPdf({ input: pdfPath, outputDir: outputDir || null })
    if (result.success) result.files.forEach(f => setLogs(prev => [...prev, `✓ ${f.split('\\').pop()}`]))
    else setLogs(prev => [...prev, `✗ ${result.error}`])
  }

  const handleConvert = async () => {
    if (!files.length) return
    setConverting(true); setLogs([]); setProgress({ current: 0, total: files.length })

    if (mode === 'image') {
      await convertImages()
    } else if (pdfAction === 'toImages') {
      setProgress({ current: 0, total: files.reduce((a, _) => a + 1, 0) })
      for (const f of files) {
        setLogs(prev => [...prev, `Processing: ${f.split('\\').pop()}...`])
        try {
          const pages = await pdfToImages(f)
          setLogs(prev => [...prev, `✓ Exported ${pages.length} pages from ${f.split('\\').pop()}`])
        } catch (e) {
          setLogs(prev => [...prev, `✗ ${f.split('\\').pop()}: ${e.message}`])
        }
        setProgress(p => ({ ...p, current: p.current + 1 }))
      }
    } else if (pdfAction === 'merge') {
      await imagesToPdf()
    } else if (pdfAction === 'split') {
      for (const f of files) { await splitPdf(f); setProgress(p => ({ ...p, current: p.current + 1 })) }
    }

    setConverting(false)
  }

  const pct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white/90 mb-1">File Converter</h2>
      <p className="text-white/40 text-sm mb-6">Convert images between formats. Export PDF pages to images, merge images into PDF, or split PDFs.</p>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id:'image', label:'Image Converter', icon: Image },
          { id:'pdf',   label:'PDF Tools',       icon: FileText }
        ].map(m => { const Icon = m.icon; return (
          <button key={m.id} onClick={() => { setMode(m.id); setFiles([]) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: mode===m.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${mode===m.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: mode===m.id ? 'rgba(165,180,252,1)' : 'rgba(255,255,255,0.4)' }}>
            <Icon className="w-4 h-4" />{m.label}
          </button>
        )})}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Drop zone + file list */}
        <div className="col-span-3 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='rgba(99,102,241,0.6)' }}
            onDragLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)' }}
            onClick={handleFileSelect}
            className="rounded-xl p-8 text-center cursor-pointer transition-all"
            style={{ border:'2px dashed rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.02)' }}
          >
            <Upload className="w-7 h-7 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">Drag & drop or click to browse</p>
            <p className="text-white/20 text-xs mt-1">{mode==='image'
              ? 'JPG, PNG, WEBP, GIF, BMP, TIFF'
              : pdfAction==='merge' ? 'Select images to merge into PDF' : 'PDF files'
            }</p>
          </div>

          {files.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex justify-between px-4 py-2.5" style={{ background:'rgba(0,0,0,0.4)' }}>
                <p className="text-xs text-white/30">{files.length} file{files.length!==1?'s':''}</p>
                <button onClick={() => setFiles([])} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Clear</button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center px-4 py-2 border-t" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                    <span className="flex-1 text-xs text-white/50 font-mono truncate">{f.split('\\').pop()}</span>
                    <button onClick={() => setFiles(p => p.filter((_,j)=>j!==i))} className="text-white/20 hover:text-red-400 text-xs ml-3 flex-shrink-0"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {converting && progress.total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-white/30 mb-1.5">
                <span>Processing…</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width:`${pct}%`, background:'linear-gradient(90deg,rgba(99,102,241,0.8),rgba(168,85,247,0.8))' }} />
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="rounded-xl p-4 font-mono text-xs space-y-1 max-h-44 overflow-y-auto"
              style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.06)' }}>
              {logs.map((l,i) => (
                <div key={i} className={l.startsWith('✓')?'text-green-400':l.startsWith('✗')?'text-red-400':'text-white/40'}>{l}</div>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="col-span-2 space-y-4">
          {mode === 'image' && <>
            <Block title="Output Format">
              <div className="flex flex-wrap gap-2">
                {FORMATS.map(f => (
                  <button key={f} onClick={() => setOutputFormat(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
                    style={{ background: outputFormat===f?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.05)',
                      border:`1px solid ${outputFormat===f?'rgba(99,102,241,0.6)':'rgba(255,255,255,0.08)'}`,
                      color: outputFormat===f?'rgba(165,180,252,1)':'rgba(255,255,255,0.3)' }}>{f}</button>
                ))}
              </div>
            </Block>
            <Block title={`Quality: ${quality}`}>
              <input type="range" min="10" max="100" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-full accent-indigo-500" />
            </Block>
            <Block title="Resize (optional)">
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="W" value={resize.width} onChange={e=>setResize(p=>({...p,width:e.target.value}))}
                  className="w-16 rounded-lg px-2 py-1.5 text-sm text-center text-white/70 outline-none"
                  style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }} />
                <span className="text-white/20 text-xs">×</span>
                <input type="number" placeholder="H" value={resize.height} onChange={e=>setResize(p=>({...p,height:e.target.value}))}
                  className="w-16 rounded-lg px-2 py-1.5 text-sm text-center text-white/70 outline-none"
                  style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }} />
                <span className="text-white/30 text-xs">px</span>
              </div>
            </Block>
          </>}

          {mode === 'pdf' && (
            <Block title="PDF Action">
              {[
                { id:'toImages', label:'PDF → Images (PNG)', desc:'Export each page as a PNG file' },
                { id:'merge',    label:'Images → PDF',       desc:'Combine images into one PDF' },
                { id:'split',    label:'Split PDF',           desc:'Save each page as a separate PDF' },
              ].map(a => (
                <div key={a.id} onClick={() => { setPdfAction(a.id); setFiles([]) }}
                  className="p-3 rounded-lg cursor-pointer transition-all"
                  style={{ background: pdfAction===a.id?'rgba(99,102,241,0.15)':'rgba(255,255,255,0.03)',
                    border:`1px solid ${pdfAction===a.id?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.07)'}` }}>
                  <p className="text-white/70 text-sm font-medium">{a.label}</p>
                  <p className="text-white/30 text-xs">{a.desc}</p>
                </div>
              ))}
            </Block>
          )}

          <Block title="Output Folder">
            <button onClick={handleSelectOutput} className="w-full rounded-lg px-3 py-2.5 text-sm text-left transition-colors"
              style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }}>
              {outputDir ? <span className="text-white/60 font-mono text-xs truncate block">{outputDir}</span>
                : <span className="text-white/25">Same folder as input (default)</span>}
            </button>
          </Block>

          <button onClick={handleConvert} disabled={!files.length || converting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.8),rgba(168,85,247,0.7))' }}>
            {converting ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
              : <><RefreshCw className="w-4 h-4" />Convert {files.length} file{files.length!==1?'s':''}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function Block({ title, children }) {
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">{title}</p>
      {children}
    </div>
  )
}
