import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain, Check } from 'lucide-react'

const MODES = [
  { id: 'work',   label: 'Focus',       default: 25, color: 'rgba(99,102,241,1)' },
  { id: 'short',  label: 'Short Break', default: 5,  color: 'rgba(52,211,153,1)' },
  { id: 'long',   label: 'Long Break',  default: 15, color: 'rgba(251,191,36,1)' },
]

function beep(freq = 660, dur = 0.4) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
    setTimeout(() => ctx.close(), (dur + 0.1) * 1000)
  } catch {}
}

export default function PomodoroTimer() {
  const [modeIdx, setModeIdx]   = useState(0)
  const [durations, setDurations] = useState({ work:25, short:5, long:15 })
  const [seconds, setSeconds]   = useState(25 * 60)
  const [running, setRunning]   = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)
  const mode = MODES[modeIdx]

  const total = durations[mode.id] * 60
  const pct   = ((total - seconds) / total) * 100
  const r = 72
  const circ = 2 * Math.PI * r

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            beep()
            handleComplete()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, modeIdx])

  const handleComplete = () => {
    setRunning(false)
    clearInterval(intervalRef.current)
    if (modeIdx === 0) {
      const next = (sessions + 1) % 4 === 0 ? 2 : 1
      setSessions(s => s + 1)
      switchMode(next)
    } else {
      switchMode(0)
    }
  }

  const switchMode = (idx) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setModeIdx(idx)
    const keys = ['work', 'short', 'long']
    setSeconds(durations[keys[idx]] * 60)
  }

  const toggle  = () => setRunning(r => !r)
  const reset   = () => { setRunning(false); setSeconds(durations[mode.id] * 60) }
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white/90 mb-1">Pomodoro Timer</h2>
      <p className="text-white/40 text-sm mb-8">Stay focused with timed work sessions and breaks.</p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-8">
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => switchMode(i)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: modeIdx===i?`${m.color}22`:  'rgba(255,255,255,0.04)',
              border: `1px solid ${modeIdx===i ? m.color : 'rgba(255,255,255,0.08)'}`,
              color: modeIdx===i ? m.color : 'rgba(255,255,255,0.4)' }}>
            {m.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-4 rounded-xl glass-card">
          <Check className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-white/60 text-sm font-semibold">{sessions} sessions</span>
        </div>
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative" style={{ width: 200, height: 200 }}>
          <svg width={200} height={200} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={100} cy={100} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
            <circle cx={100} cy={100} r={r} fill="none" stroke={mode.color} strokeWidth={8}
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold font-mono text-white/90 tracking-tight">{mm}:{ss}</span>
            <span className="text-white/30 text-xs mt-1 uppercase tracking-wider">{mode.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button onClick={reset} className="w-11 h-11 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all" style={{ background:'rgba(255,255,255,0.06)' }}>
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={toggle}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all"
          style={{ background: `linear-gradient(135deg, ${mode.color}cc, ${mode.color}88)`, boxShadow: `0 0 24px ${mode.color}44` }}>
          {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button onClick={() => switchMode((modeIdx + 1) % 3)}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all" style={{ background:'rgba(255,255,255,0.06)' }}>
          <Coffee className="w-4 h-4" />
        </button>
      </div>

      {/* Duration settings */}
      <div className="glass-card p-5">
        <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-4">Durations (minutes)</p>
        <div className="grid grid-cols-3 gap-4">
          {[['work','Focus',6,60],['short','Short Break',1,30],['long','Long Break',5,60]].map(([key, label, min, max]) => (
            <div key={key}>
              <p className="text-xs text-white/40 mb-2">{label}: {durations[key]}m</p>
              <input type="range" min={min} max={max} value={durations[key]}
                onChange={e => { const v = Number(e.target.value); setDurations(d => ({ ...d, [key]:v })); if (!running && MODES[modeIdx].id===key) setSeconds(v*60) }}
                className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
