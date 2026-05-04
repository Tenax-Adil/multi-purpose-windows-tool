import { useState, useEffect, useRef } from 'react'

const PRESETS = [
  { label: 'Tabata', work: 20, rest: 10, rounds: 8 },
  { label: 'HIIT', work: 40, rest: 20, rounds: 10 },
  { label: 'EMOM', work: 50, rest: 10, rounds: 12 },
  { label: 'Custom', work: 30, rest: 15, rounds: 6 },
]

export default function WorkoutTimer() {
  const [work, setWork] = useState(20)
  const [rest, setRest] = useState(10)
  const [rounds, setRounds] = useState(8)
  const [running, setRunning] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [phase, setPhase] = useState('work') // work | rest
  const [timeLeft, setTimeLeft] = useState(20)
  const [done, setDone] = useState(false)
  const audioRef = useRef(null)

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      osc.frequency.value = phase === 'work' ? 880 : 440
      osc.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 0.15)
    } catch {}
  }

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          beep()
          if (phase === 'work') {
            setPhase('rest'); return rest
          } else {
            if (currentRound >= rounds) { setRunning(false); setDone(true); return 0 }
            setCurrentRound(r => r + 1); setPhase('work'); return work
          }
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, phase, currentRound, rounds, work, rest])

  const start = () => { setDone(false); setCurrentRound(1); setPhase('work'); setTimeLeft(work); setRunning(true) }
  const stop = () => { setRunning(false) }
  const toggle = () => running ? stop() : (done ? start() : setRunning(true))

  const loadPreset = p => { setWork(p.work); setRest(p.rest); setRounds(p.rounds); setTimeLeft(p.work); setRunning(false); setDone(false); setCurrentRound(1); setPhase('work') }

  const pct = phase === 'work' ? ((work - timeLeft) / work) * 100 : ((rest - timeLeft) / rest) * 100
  const radius = 80, circ = 2 * Math.PI * radius, offset = circ - (pct / 100) * circ
  const phaseColor = phase === 'work' ? '#ef4444' : '#10b981'
  const totalTime = (work + rest) * rounds

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Workout Timer</h2>
      <p className="text-white/40 text-sm mb-6">HIIT / Tabata interval timer</p>

      <div className="flex gap-2 mb-6">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => loadPreset(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold ${work === p.work && rest === p.rest && rounds === p.rounds ? 'btn-primary' : 'btn-ghost'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {!running && !done && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div><label className="text-xs text-white/30 mb-1 block">Work (sec)</label>
            <input value={work} onChange={e => { setWork(+e.target.value || 0); setTimeLeft(+e.target.value || 0) }} type="number" className="input-base text-center" /></div>
          <div><label className="text-xs text-white/30 mb-1 block">Rest (sec)</label>
            <input value={rest} onChange={e => setRest(+e.target.value || 0)} type="number" className="input-base text-center" /></div>
          <div><label className="text-xs text-white/30 mb-1 block">Rounds</label>
            <input value={rounds} onChange={e => setRounds(+e.target.value || 1)} type="number" className="input-base text-center" /></div>
        </div>
      )}

      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="90" cy="90" r={radius} fill="none" stroke={phaseColor} strokeWidth="6"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.3s' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: phaseColor }}>
              {done ? 'Done!' : phase}
            </span>
            <span className="text-5xl font-bold text-white/90 font-mono">{timeLeft}</span>
            <span className="text-xs text-white/25">Round {currentRound}/{rounds}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={toggle} className="btn-primary px-8 py-2.5 text-sm">
            {done ? 'Restart' : running ? 'Pause' : 'Start'}
          </button>
          {running && <button onClick={start} className="btn-ghost px-4 py-2.5 text-xs">Reset</button>}
        </div>
      </div>

      <div className="text-center text-xs text-white/20">
        Total: {Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2, '0')}
      </div>
    </div>
  )
}
