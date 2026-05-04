import { useState, useRef, useEffect } from 'react'

export default function QrStudio() {
  const [input, setInput] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const canvasRef = useRef()

  const generate = async () => {
    if (!input.trim()) return
    try {
      // Use a simple QR generation via a canvas-based approach
      const size = 256
      const QRCode = await import('qrcode')
      const url = await QRCode.toDataURL(input, {
        width: size, margin: 2,
        color: { dark: '#818cf8', light: '#08080f' }
      })
      setQrDataUrl(url)
    } catch (e) {
      // Fallback: use a free API
      setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(input)}&bgcolor=08080f&color=818cf8`)
    }
  }

  const download = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">QR Code Studio</h2>
      <p className="text-white/40 text-sm mb-6">Generate QR codes from text or URLs</p>

      <div className="flex gap-2 mb-6">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Enter text or URL…" className="input-base flex-1"
          onKeyDown={e => e.key === 'Enter' && generate()} />
        <button onClick={generate} disabled={!input.trim()} className="btn-primary px-5 py-2 text-sm">Generate</button>
      </div>

      {qrDataUrl && (
        <div className="flex flex-col items-center gap-4">
          <div className="glass-card p-6">
            <img src={qrDataUrl} alt="QR Code" style={{ width: 256, height: 256, borderRadius: 8 }} />
          </div>
          <div className="flex gap-2">
            <button onClick={download} className="btn-ghost px-4 py-2 text-xs">Download PNG</button>
            <button onClick={() => navigator.clipboard.writeText(input)} className="btn-ghost px-4 py-2 text-xs">Copy Text</button>
          </div>
          <p className="text-[10px] text-white/20 text-center max-w-xs truncate">{input}</p>
        </div>
      )}

      <div className="mt-8 glass-card p-4">
        <h3 className="text-xs text-white/40 font-semibold mb-2">Quick Generate</h3>
        <div className="flex gap-2 flex-wrap">
          {['https://github.com', 'https://google.com', 'Hello World!', 'wifi:nextools'].map(t => (
            <button key={t} onClick={() => { setInput(t); setTimeout(generate, 100) }}
              className="btn-ghost px-3 py-1.5 text-[10px] font-mono">{t}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
