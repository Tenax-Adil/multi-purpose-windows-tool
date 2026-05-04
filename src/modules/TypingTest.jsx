import { useState, useEffect, useRef, useCallback } from 'react'

const TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank on a warm summer evening.",
  "Programming is the art of telling another human being what one wants the computer to do.",
  "In the beginning there was nothing, which exploded. A thing can be true and still be funny.",
  "Every great developer you know got there by solving problems they were unqualified to solve.",
  "The best way to predict the future is to invent it. Stay hungry, stay foolish, keep learning.",
]

export default function TypingTest() {
  const [text] = useState(() => TEXTS[Math.floor(Math.random() * TEXTS.length)])
  const [input, setInput] = useState('')
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [best, setBest] = useState(() => +localStorage.getItem('nex_typing_best') || 0)
  const inputRef = useRef()

  const done = input.length >= text.length
  const elapsed = endTime ? (endTime - startTime) / 1000 : startTime ? (Date.now() - startTime) / 1000 : 0

  const words = input.trim().split(/\s+/).length
  const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0

  let correct = 0
  for (let i = 0; i < input.length; i++) { if (input[i] === text[i]) correct++ }
  const accuracy = input.length > 0 ? Math.round((correct / input.length) * 100) : 100

  useEffect(() => {
    if (done && !endTime) {
      const end = Date.now()
      setEndTime(end)
      const finalWpm = Math.round((words / ((end - startTime) / 1000)) * 60)
      if (finalWpm > best) { setBest(finalWpm); localStorage.setItem('nex_typing_best', finalWpm) }
    }
  }, [done])

  const handleInput = e => {
    if (done) return
    if (!started) { setStarted(true); setStartTime(Date.now()) }
    setInput(e.target.value)
  }

  const restart = () => {
    setInput(''); setStarted(false); setStartTime(null); setEndTime(null)
    inputRef.current?.focus()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Typing Speed Test</h2>
      <p className="text-white/40 text-sm mb-6">Test your WPM and accuracy</p>

      <div className="glass-card p-5 mb-4 font-mono text-sm leading-7 select-none">
        {text.split('').map((char, i) => {
          let color = 'rgba(255,255,255,0.25)'
          if (i < input.length) color = input[i] === char ? '#34d399' : '#f87171'
          if (i === input.length) color = '#818cf8'
          return <span key={i} style={{ color, textDecoration: i === input.length ? 'underline' : 'none' }}>{char}</span>
        })}
      </div>

      <textarea ref={inputRef} value={input} onChange={handleInput} rows={3}
        className="input-base font-mono text-sm mb-4" placeholder={done ? 'Done! Click restart.' : 'Start typing here…'}
        disabled={done} autoFocus style={{ resize: 'none' }} />

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="card-elevated p-3 text-center" style={{ borderTop: '2px solid #6366f1' }}>
          <span className="text-[10px] text-white/30">WPM</span>
          <p className="text-xl font-bold text-indigo-400">{wpm}</p>
        </div>
        <div className="card-elevated p-3 text-center" style={{ borderTop: '2px solid #10b981' }}>
          <span className="text-[10px] text-white/30">Accuracy</span>
          <p className="text-xl font-bold text-emerald-400">{accuracy}%</p>
        </div>
        <div className="card-elevated p-3 text-center" style={{ borderTop: '2px solid #f59e0b' }}>
          <span className="text-[10px] text-white/30">Time</span>
          <p className="text-xl font-bold text-amber-400">{elapsed.toFixed(1)}s</p>
        </div>
        <div className="card-elevated p-3 text-center" style={{ borderTop: '2px solid #ef4444' }}>
          <span className="text-[10px] text-white/30">Best WPM</span>
          <p className="text-xl font-bold text-red-400">{best || '—'}</p>
        </div>
      </div>

      <button onClick={restart} className="btn-primary px-5 py-2 text-sm">Restart</button>
    </div>
  )
}
