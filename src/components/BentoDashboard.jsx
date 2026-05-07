import { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Chip, Tabs, Tab } from '@mui/material'
import { Cpu, Tv, Bolt, Gamepad2, CheckCircle2 } from 'lucide-react'

import Sorter from '../modules/Sorter'
import Renamer from '../modules/Renamer'
import DuplicateFinder from '../modules/DuplicateFinder'
import QuickNotes from '../modules/QuickNotes'
import MultiStopwatch from '../modules/MultiStopwatch'
import QrStudio from '../modules/QrStudio'

const BentoTile = ({ children, sx = {} }) => (
  <Box sx={{
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 4,
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, background 0.2s',
    '&:hover': { background: 'rgba(255,255,255,0.05)', transform: 'translateY(-2px)' },
    ...sx
  }}>
    {children}
  </Box>
)

const TOOLS = [
  { id: 'quicknotes', label: 'Quick Notes', comp: QuickNotes },
  { id: 'sorter', label: 'Smart Sorter', comp: Sorter },
  { id: 'renamer', label: 'Bulk Renamer', comp: Renamer },
  { id: 'duplicates', label: 'Duplicate Finder', comp: DuplicateFinder },
  { id: 'stopwatch', label: 'Stopwatch', comp: MultiStopwatch },
  { id: 'qr', label: 'QR Studio', comp: QrStudio },
]

export default function BentoDashboard() {
  const [activeTab, setActiveTab] = useState('quicknotes')

  const ActiveComp = TOOLS.find(t => t.id === activeTab)?.comp || QuickNotes

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 600, fontSize: 14, minHeight: 48 },
                '& .Mui-selected': { color: 'white !important' },
                '& .MuiTabs-indicator': { backgroundColor: '#a78bfa' } }}>
          {TOOLS.map(t => (
            <Tab key={t.id} value={t.id} label={t.label} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <ActiveComp />
      </Box>
    </Box>
  )
}
