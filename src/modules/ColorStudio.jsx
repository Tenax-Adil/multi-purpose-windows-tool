import { useState, useRef, useCallback } from 'react'

const hexToRgb = hex => {
  const m = hex.replace('#','').match(/.{2}/g)
  return m ? m.map(x => parseInt(x, 16)) : [0,0,0]
}
const rgbToHsl = (r,g,b) => {
  r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min
  let h=0,s=0,l=(max+min)/2
  if(d!==0){s=l>0.5?d/(2-max-min):d/(max-min);h=max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4;h*=60}
  return [Math.round(h),Math.round(s*100),Math.round(l*100)]
}
const contrastRatio = (hex1, hex2) => {
  const lum = hex => {
    const [r,g,b] = hexToRgb(hex).map(c => { c/=255; return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4) })
    return 0.2126*r + 0.7152*g + 0.0722*b
  }
  const l1=lum(hex1),l2=lum(hex2)
  return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2)
}

export default function ColorStudio() {
  const [color, setColor] = useState('#6366f1')
  const [bg, setBg] = useState('#ffffff')
  const [r,g,b] = hexToRgb(color)
  const [h,s,l] = rgbToHsl(r,g,b)
  const ratio = contrastRatio(color, bg)
  const passAA = ratio >= 4.5
  const passAAA = ratio >= 7

  const palette = Array.from({length:8},(_,i)=>{
    const lightness = 10 + i*11
    return `hsl(${h},${s}%,${lightness}%)`
  })

  const copy = txt => navigator.clipboard.writeText(txt)

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Color Studio</h2>
      <p className="text-white/40 text-sm mb-6">Pick, convert, and check contrast</p>

      <div className="flex gap-4 mb-6">
        <div className="w-28 h-28 rounded-2xl border border-white/10" style={{background:color}}/>
        <div className="flex-1 space-y-3">
          <div className="flex gap-2 items-end">
            <div><label className="text-[10px] text-white/30 block mb-1">Color</label>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)}
              className="w-10 h-8 rounded cursor-pointer bg-transparent border-none"/></div>
            <input value={color} onChange={e=>setColor(e.target.value)} className="input-base font-mono !w-28"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{l:'HEX',v:color},{l:'RGB',v:`rgb(${r},${g},${b})`},{l:'HSL',v:`hsl(${h},${s}%,${l}%)`}].map(x=>(
              <button key={x.l} onClick={()=>copy(x.v)} className="btn-ghost px-3 py-1.5 text-xs font-mono" title="Click to copy">
                <span className="text-white/25 mr-1">{x.l}</span>{x.v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 mb-4">
        <h3 className="text-xs text-white/40 font-semibold mb-3">WCAG Contrast Checker</h3>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-xs text-white/30">Background:</label>
          <input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-8 h-6 rounded cursor-pointer bg-transparent border-none"/>
          <input value={bg} onChange={e=>setBg(e.target.value)} className="input-base font-mono !w-24 text-xs"/>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{background:bg,border:'1px solid rgba(255,255,255,0.1)'}}>
          <span style={{color}} className="text-lg font-bold">Sample Text</span>
          <span style={{color}} className="text-xs">Small body text</span>
        </div>
        <div className="flex gap-3 mt-3">
          <span className="text-sm font-mono text-white/60">Ratio: {ratio}:1</span>
          <span className={`tag text-[10px] ${passAA?'tag-green':'tag-red'}`}>AA {passAA?'✓':'✗'}</span>
          <span className={`tag text-[10px] ${passAAA?'tag-green':'tag-red'}`}>AAA {passAAA?'✓':'✗'}</span>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-xs text-white/40 font-semibold mb-3">Palette</h3>
        <div className="flex gap-1">
          {palette.map((c,i)=>(
            <button key={i} onClick={()=>copy(c)} className="flex-1 h-10 rounded-lg transition-transform hover:scale-110 cursor-pointer"
              style={{background:c}} title={c}/>
          ))}
        </div>
      </div>
    </div>
  )
}
