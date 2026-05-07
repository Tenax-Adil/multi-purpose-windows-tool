// modules/PolishHub/index.jsx — Polishing & Gamification hub
import { useState } from 'react'
import { createTheme, ThemeProvider, CssBaseline, Box, Typography, Tabs, Tab } from '@mui/material'


// Micro-tools
import FlashcardMaker from '../FlashcardMaker'
import UnitConverter from '../UnitConverter'
import WordAnalyzer from '../WordAnalyzer'
import StudyTodo from '../StudyTodo'
import GradeCalculator from '../GradeCalculator'
import WeeklyTimetable from '../WeeklyTimetable'
import StudyAnalytics from '../StudyAnalytics'
import RandomQuiz from '../RandomQuiz'
import HomeworkDeadline from '../HomeworkDeadline'

const theme = createTheme({
  palette: { mode:'dark', background:{ default:'transparent', paper:'rgba(255,255,255,0.04)' }, primary:{ main:'#a78bfa' } },
  typography: { fontFamily:'Inter, system-ui, sans-serif' },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage:'none', background:'rgba(255,255,255,0.04)',
      backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16 }}},
    MuiButton: { styleOverrides: { root: { textTransform:'none', borderRadius:10, fontWeight:600 } } },
    MuiTab:    { styleOverrides: { root: { textTransform:'none', fontWeight:600, fontSize:12 } } },
  },
})

const TABS = [
  { label:'Flashcards',       component: FlashcardMaker },
  { label:'Unit Converter',   component: UnitConverter },
  { label:'Word Analyzer',    component: WordAnalyzer },
  { label:'Study ToDo',       component: StudyTodo },
  { label:'Grade Calc',       component: GradeCalculator },
  { label:'Timetable',        component: WeeklyTimetable },
  { label:'Study Stats',      component: StudyAnalytics },
  { label:'Random Quiz',      component: RandomQuiz },
  { label:'Deadlines',        component: HomeworkDeadline },
]

export default function PolishHub() {
  const [tab, setTab] = useState(0)
  const Active = TABS[tab].component
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ mb:2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color:'rgba(255,255,255,0.9)' }}>Polish & Study Hub</Typography>
          <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.35)', mt:0.5 }}>Gamification · Study Tools · Utilities</Typography>
        </Box>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb:2,
          '& .MuiTabs-indicator':{ background:'#a78bfa' },
          '& .Mui-selected':{ color:'#a78bfa !important' },
          '& .MuiTab-root':{ color:'rgba(255,255,255,0.4)' },
        }}>
          {TABS.map((t,i) => <Tab key={i} label={t.label}/>)}
        </Tabs>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Active/>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
