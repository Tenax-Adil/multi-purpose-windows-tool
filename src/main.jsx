import { StrictMode, useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Play, Pause, Square, ChevronRight, Inbox, Timer, RotateCcw, Coffee } from 'lucide-react'
import './index.css'
import App from './App.jsx'

function OmniLauncher() {
  const [query, setQuery] = useState('')
  return (
    <div className="w-full h-full flex items-center justify-center p-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full h-full glass-panel flex items-center px-4 rounded-full bg-black/60 shadow-[0_0_30px_rgba(255,255,255,0.05)] border-glass-border">
        <Search className="w-6 h-6 text-slate-400 mr-3" />
        <input 
          autoFocus
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search apps or files..." 
          className="w-full bg-transparent text-xl text-white outline-none placeholder:text-slate-500 font-light"
        />
        <ChevronRight className="w-6 h-6 text-slate-600" />
      </div>
    </div>
  )
}

function FocusTimer() {
  const [time, setTime] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval = null
    if (isActive && time > 0) interval = setInterval(() => setTime(t => t - 1), 1000)
    else clearInterval(interval)
    return () => clearInterval(interval)
  }, [isActive, time])

  return (
    <div className="w-full h-full flex items-center justify-center p-2 animate-in fade-in duration-300">
      <div className="w-full h-full glass-panel flex items-center justify-between px-4 rounded-full bg-black/60 app-drag-region">
        <span className="text-2xl font-mono text-white font-light tracking-widest no-drag-region">
          {Math.floor(time / 60).toString().padStart(2, '0')}:{(time % 60).toString().padStart(2, '0')}
        </span>
        <div className="flex gap-2 no-drag-region">
          <button onClick={() => setIsActive(!isActive)} className="text-slate-300 hover:text-white transition-colors">
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={() => { setIsActive(false); setTime(25 * 60) }} className="text-slate-500 hover:text-white transition-colors">
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Dropzone() {
  return (
    <div className="w-full h-full p-2 app-drag-region">
      <div className="w-full h-full glass-panel rounded-xl bg-black/40 border-dashed hover:border-solid hover:bg-white/5 transition-all flex flex-col items-center justify-center text-center p-4">
        <Inbox className="w-8 h-8 text-slate-400 mb-2" />
        <span className="text-xs text-slate-300 font-medium no-drag-region cursor-pointer">Drop files</span>
      </div>
    </div>
  )
}

function Router() {
  const hash = window.location.hash

  if (hash === '#dropzone') return <Dropzone />
  if (hash === '#launcher') return <OmniLauncher />
  if (hash === '#timer') return <FocusTimer />
  
  return <App />
}

const container = document.getElementById('root')
// Cache the root so HMR re-renders don't create a second root
if (!container._reactRoot) {
  container._reactRoot = createRoot(container)
}
container._reactRoot.render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
