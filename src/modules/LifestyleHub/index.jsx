// LifestyleHub/index.jsx
import { useState } from 'react'
import { createTheme, ThemeProvider, CssBaseline, Box, Typography, Tabs, Tab } from '@mui/material'


// Micro-tools
import BodyCalculator from '../BodyCalculator'
import WorkoutLog from '../WorkoutLog'
import WaterTracker from '../WaterTracker'
import MacroCalc from '../MacroCalc'
import WorkoutTimer from '../WorkoutTimer'
import PomodoroTimer from '../PomodoroTimer'
import HabitTracker from '../HabitTracker'
import BudgetTracker from '../BudgetTracker'

const theme = createTheme({
  palette: { mode: 'dark', background: { default: 'transparent', paper: 'rgba(255,255,255,0.04)' }, primary: { main: '#a78bfa' } },
  typography: { fontFamily: 'Inter, system-ui, sans-serif' },
  components: {
    MuiPaper: { styleOverrides: { root: {
      backgroundImage: 'none', background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
    }}},
    MuiButton:    { styleOverrides: { root: { textTransform: 'none', borderRadius: 10, fontWeight: 600 } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': {
      background: 'rgba(255,255,255,0.04)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    }}}},
  },
})

const TOOLS = [
  { id: 'habit', label: 'Habit Tracker', comp: HabitTracker },
  { id: 'pomodoro', label: 'Pomodoro', comp: PomodoroTimer },
  { id: 'budget', label: 'Budget', comp: BudgetTracker },
  { id: 'water', label: 'Water Tracker', comp: WaterTracker },
  { id: 'workout', label: 'Workout Log', comp: WorkoutLog },
  { id: 'body', label: 'Body Calc', comp: BodyCalculator },
  { id: 'macro', label: 'Macro Calc', comp: MacroCalc },
  { id: 'wtimer', label: 'Workout Timer', comp: WorkoutTimer },
]

export default function LifestyleHub() {
  const [activeTab, setActiveTab] = useState('habit')

  const ActiveComp = TOOLS.find(t => t.id === activeTab)?.comp || HabitTracker

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 600, fontSize: 14, minHeight: 48 },
                  '& .Mui-selected': { color: 'white !important' },
                  '& .MuiTabs-indicator': { backgroundColor: theme.palette.primary.main } }}>
            {TOOLS.map(t => (
              <Tab key={t.id} value={t.id} label={t.label} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <ActiveComp />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
