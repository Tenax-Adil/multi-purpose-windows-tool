import { useState, useEffect, createContext, useContext, useCallback } from 'react'

import Sidebar from './components/Sidebar'
import BentoDashboard from './components/BentoDashboard'
import { Zap, Minus, Maximize2, Maximize, X } from 'lucide-react'

// Static hub imports — no lazy(), no Suspense, no dynamic import()
import AnimeCenter from './modules/AnimeCenter/index'
import SecurityHub from './modules/SecurityHub/index'
import LifestyleHub from './modules/LifestyleHub/index'
import PolishHub from './modules/PolishHub/index'

// Toast Context
const ToastCtx = createContext()
export function useToast() { return useContext(ToastCtx) }

function ToastProvider({children}) {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-enter" style={{
            background: t.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            border: `1px solid ${t.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            color: t.type === 'error' ? '#fca5a5' : '#6ee7b7',
            padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500, minWidth: 220,
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export default function App() {
  return <ToastProvider><AppInner/></ToastProvider>
}

function AppInner() {
  const [activeTab, setActiveTab] = useState(null)
  const [moduleKey, setModuleKey] = useState(0)

  // Wallpaper Glass Sync
  useEffect(() => {
    if (!window.electronAPI?.getWallpaperColor) return
    window.electronAPI.getWallpaperColor().then(color => {
      if (color) document.documentElement.style.setProperty('--wp-glow', color)
    }).catch(() => {})
  }, [])

  const navigate = id => {
    setActiveTab(id)
    setModuleKey(k => k + 1)
  }

  const hubMap = {
    animecenter: AnimeCenter,
    securityhub: SecurityHub,
    lifestylehub: LifestyleHub,
    polishhub: PolishHub,
  }

  const getHubName = (id) => {
    if (!id) return 'Home Dashboard'
    const names = {
      animecenter: 'Anime & Media Center',
      securityhub: 'Password & Security',
      lifestylehub: 'Gaming & Lifestyle',
      polishhub: 'Polish & Gamification',
    }
    return names[id] || id
  }

  const ActiveHub = activeTab ? hubMap[activeTab] : null

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: '#08080f', borderRadius: 12 }}>
      {/* Titlebar */}
      <div className="h-9 flex items-center flex-shrink-0 app-drag-region select-none"
        style={{ background: 'rgba(0,0,0,0.55)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 px-4 w-[220px] flex-shrink-0">
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold tracking-[0.2em] gradient-text uppercase">NexTools</span>
        </div>
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <span className="text-white/15 text-xs">/</span>
          <span className="text-white/50 text-xs truncate">{getHubName(activeTab)}</span>
        </div>
        <div className="flex items-center no-drag-region gap-2 pr-1">
          {[{ i: Minus, a: 'minimizeWindow' }, { i: Maximize2, a: 'maximizeWindow' }, { i: Maximize, a: 'toggleFullscreen' }, { i: X, a: 'closeWindow', c: true }]
            .map(({ i: Icon, a, c }) => (
              <button key={a} onClick={() => window.electronAPI[a]()}
                className={`w-11 h-9 flex items-center justify-center text-white/25 hover:text-white transition-all ${c ? 'hover:bg-red-500/80 rounded-tr-[10px]' : 'hover:bg-white/10'}`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <Sidebar activeTab={activeTab} navigate={navigate} />

        <main className="flex-1 overflow-y-auto min-w-0" style={{ background: 'rgba(8,8,15,0.9)' }}>
          <div key={moduleKey} className="p-7 module-enter h-full">
            {ActiveHub ? <ActiveHub /> : <BentoDashboard />}
          </div>
        </main>
      </div>
    </div>
  )
}
