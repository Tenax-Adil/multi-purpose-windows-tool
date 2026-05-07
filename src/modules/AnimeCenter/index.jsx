// AnimeCenter/index.jsx
import { useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab } from '@mui/material'
import { LiveTv, AutoAwesome, Search, SyncAlt, PhotoSizeSelectLarge, Compress } from '@mui/icons-material'


// Micro-tools
import Converter from '../Converter'
import BatchResizer from '../BatchResizer'
import ImageCompressor from '../ImageCompressor'

const darkGlass = createTheme({
  palette: { mode: 'dark', background: { default: 'transparent' } },
  typography: { fontFamily: 'Inter, system-ui, sans-serif' },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
        }
      }
    },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, letterSpacing: 0.3 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10 } } },
  }
})

const TABS = [
  { label: 'Converter', icon: <SyncAlt sx={{ fontSize: 18 }} /> },
  { label: 'Batch Resizer', icon: <PhotoSizeSelectLarge sx={{ fontSize: 18 }} /> },
  { label: 'Compressor', icon: <Compress sx={{ fontSize: 18 }} /> },
]

export default function AnimeCenter() {
  const [tab, setTab] = useState(0)

  return (
    <ThemeProvider theme={darkGlass}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ mb: 1 }}>
          <h2 style={{ margin: '0 0 2px', color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 24 }}>
            Anime & Media Center
          </h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            Media Converters & Image Optimization
          </p>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{
            mb: 2,
            '& .MuiTabs-indicator': { background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', height: 3, borderRadius: 2 },
            '& .MuiTab-root': { color: 'rgba(255,255,255,0.35)', '&.Mui-selected': { color: '#a78bfa' } },
          }}
        >
          {TABS.map((t, i) => (
            <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} />
          ))}
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {tab === 0 && <Converter />}
          {tab === 1 && <BatchResizer />}
          {tab === 2 && <ImageCompressor />}
        </Box>
      </Box>
    </ThemeProvider>
  )
}
