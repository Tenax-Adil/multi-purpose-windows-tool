import { Home, Tv, Cpu, LockKeyhole, Gamepad2, Zap, Settings } from 'lucide-react'
import { Tooltip } from '@mui/material'

const NAV_ITEMS = [
  { id: null, label: 'Dashboard', icon: Home, color: '#6366f1' },
  { id: 'animecenter', label: 'Anime & Media', icon: Tv, color: '#e879f9' },
  { id: 'securityhub', label: 'Password & Security', icon: LockKeyhole, color: '#f43f5e' },
  { id: 'lifestylehub', label: 'Lifestyle', icon: Gamepad2, color: '#a78bfa' },
  { id: 'polishhub', label: 'Polish & Gamification', icon: Zap, color: '#f59e0b' },
]

export default function Sidebar({ activeTab, navigate }) {
  return (
    <aside className="w-[60px] flex flex-col items-center py-4 flex-shrink-0 no-drag-region"
      style={{ background: 'rgba(0,0,0,0.5)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      
      {/* Nav Items */}
      <nav className="flex-1 w-full flex flex-col items-center gap-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <Tooltip key={item.label} title={item.label} placement="right" arrow
              slotProps={{ tooltip: { sx: { bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' } } }}>
              <button
                onClick={() => navigate(item.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
                style={isActive ? { borderLeft: `2px solid ${item.color}`, color: item.color } : { color: 'rgba(255,255,255,0.4)' }}
              >
                <Icon className="w-5 h-5" />
              </button>
            </Tooltip>
          )
        })}
      </nav>


    </aside>
  )
}
