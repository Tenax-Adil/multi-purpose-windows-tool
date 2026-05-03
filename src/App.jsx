import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import {
  FolderGit2, FileTerminal, RefreshCw, Copy, Globe, Monitor, Archive, Type,
  Wifi, Settings, ChevronRight, Zap, StickyNote, Power, Send, Image, Key,
  Camera, Cpu, HardDrive, FileDown, Minus, Maximize2, X, Hash, FileCode2,
  Scissors, Network, Maximize, Search, Timer, Brain, Calculator, Layers,
  DollarSign, GraduationCap, Calendar, FileSearch, ArrowLeftRight, BookMarked, Loader2
} from 'lucide-react'

// ── Lazy module imports (loaded only when first visited) ────────
const Sorter           = lazy(() => import('./modules/Sorter'))
const Renamer          = lazy(() => import('./modules/Renamer'))
const Converter        = lazy(() => import('./modules/Converter'))
const DuplicateFinder  = lazy(() => import('./modules/DuplicateFinder'))
const SystemDashboard  = lazy(() => import('./modules/SystemDashboard'))
const ClipboardManager = lazy(() => import('./modules/ClipboardManager'))
const StartupManager   = lazy(() => import('./modules/StartupManager'))
const ArchiveManager   = lazy(() => import('./modules/ArchiveManager'))
const NetworkScanner   = lazy(() => import('./modules/NetworkScanner'))
const TextTools        = lazy(() => import('./modules/TextTools'))
const FontPreview      = lazy(() => import('./modules/FontPreview'))
const FileSender       = lazy(() => import('./modules/FileSender'))
const ProcessManager   = lazy(() => import('./modules/ProcessManager'))
const QuickNotes       = lazy(() => import('./modules/QuickNotes'))
const DiskVisualizer   = lazy(() => import('./modules/DiskVisualizer'))
const BatchResizer     = lazy(() => import('./modules/BatchResizer'))
const PasswordGenerator = lazy(() => import('./modules/PasswordGenerator'))
const SystemInfoExport  = lazy(() => import('./modules/SystemInfoExport'))
const ScreenshotTool   = lazy(() => import('./modules/ScreenshotTool'))
const RegexTester      = lazy(() => import('./modules/RegexTester'))
const MarkdownPreview  = lazy(() => import('./modules/MarkdownPreview'))
const JsonCsvConverter = lazy(() => import('./modules/JsonCsvConverter'))
const FileShredder     = lazy(() => import('./modules/FileShredder'))
const WakeOnLan        = lazy(() => import('./modules/WakeOnLan'))
const PortScanner      = lazy(() => import('./modules/PortScanner'))
const ImageCompressor  = lazy(() => import('./modules/ImageCompressor'))
const PomodoroTimer    = lazy(() => import('./modules/PomodoroTimer'))
const FlashcardMaker   = lazy(() => import('./modules/FlashcardMaker'))
const UnitConverter    = lazy(() => import('./modules/UnitConverter'))
const CitationGenerator = lazy(() => import('./modules/CitationGenerator'))
const WordAnalyzer     = lazy(() => import('./modules/WordAnalyzer'))
const StudyTodo        = lazy(() => import('./modules/StudyTodo'))
const ScientificCalc   = lazy(() => import('./modules/ScientificCalc'))
const GradeCalculator  = lazy(() => import('./modules/GradeCalculator'))
const WeeklyTimetable  = lazy(() => import('./modules/WeeklyTimetable'))
const BudgetTracker    = lazy(() => import('./modules/BudgetTracker'))

// ── Navigation data ─────────────────────────────────────────────
const navGroups = [
  {
    label: 'File Tools',
    color: 'rgba(99,102,241,0.7)',
    items: [
      { id: 'sorter',        label: 'Smart Sorter',      icon: FolderGit2 },
      { id: 'renamer',       label: 'Bulk Renamer',       icon: FileTerminal },
      { id: 'converter',     label: 'File Converter',     icon: RefreshCw },
      { id: 'batchresizer',  label: 'Batch Resizer',      icon: Image },
      { id: 'compressor',    label: 'Image Compressor',   icon: Layers },
      { id: 'duplicates',    label: 'Duplicate Finder',   icon: Copy },
      { id: 'shredder',      label: 'File Shredder',      icon: Scissors },
      { id: 'archives',      label: 'Archive Manager',    icon: Archive },
      { id: 'filesender',    label: 'WiFi File Sender',   icon: Send },
    ]
  },
  {
    label: 'System',
    color: 'rgba(52,211,153,0.7)',
    items: [
      { id: 'dashboard',      label: 'System Dashboard',  icon: Monitor },
      { id: 'processes',      label: 'Process Manager',   icon: Cpu },
      { id: 'startup',        label: 'Startup Manager',   icon: Power },
      { id: 'network',        label: 'Network Scanner',   icon: Wifi },
      { id: 'portscanner',    label: 'Port Scanner',      icon: Network },
      { id: 'wol',            label: 'Wake-on-LAN',       icon: Zap },
      { id: 'diskvisualizer', label: 'Disk Visualizer',   icon: HardDrive },
      { id: 'screenshot',     label: 'Screenshot Tool',   icon: Camera },
      { id: 'sysexport',      label: 'System Report',     icon: FileDown },
    ]
  },
  {
    label: 'Tools',
    color: 'rgba(251,191,36,0.7)',
    items: [
      { id: 'texttools',    label: 'Text Tools',           icon: Globe },
      { id: 'regex',        label: 'Regex Tester',         icon: Hash },
      { id: 'markdown',     label: 'Markdown Preview',     icon: FileCode2 },
      { id: 'jsoncsvconv',  label: 'JSON ↔ CSV',           icon: RefreshCw },
      { id: 'clipboard',    label: 'Clipboard Manager',    icon: Copy },
      { id: 'fonts',        label: 'Font Preview',         icon: Type },
      { id: 'passwordgen',  label: 'Password Generator',   icon: Key },
      { id: 'quicknotes',   label: 'Quick Notes',          icon: StickyNote },
    ]
  },
  {
    label: 'Student',
    color: 'rgba(168,85,247,0.7)',
    items: [
      { id: 'pomodoro',    label: 'Pomodoro Timer',       icon: Timer },
      { id: 'flashcards',  label: 'Flashcard Maker',      icon: Brain },
      { id: 'unitconv',    label: 'Unit Converter',       icon: ArrowLeftRight },
      { id: 'citation',    label: 'Citation Generator',   icon: BookMarked },
      { id: 'wordanalyzer',label: 'Word Analyzer',        icon: FileSearch },
      { id: 'studytodo',   label: 'Study To-Do',          icon: GraduationCap },
      { id: 'scicalc',     label: 'Scientific Calc',      icon: Calculator },
      { id: 'grades',      label: 'Grade Calculator',     icon: GraduationCap },
      { id: 'timetable',   label: 'Timetable',            icon: Calendar },
      { id: 'budget',      label: 'Budget Tracker',       icon: DollarSign },
    ]
  },
]

const moduleMap = {
  sorter: Sorter, renamer: Renamer, converter: Converter,
  batchresizer: BatchResizer, compressor: ImageCompressor,
  duplicates: DuplicateFinder, shredder: FileShredder,
  archives: ArchiveManager, filesender: FileSender,
  dashboard: SystemDashboard, processes: ProcessManager,
  startup: StartupManager, network: NetworkScanner,
  portscanner: PortScanner, wol: WakeOnLan,
  diskvisualizer: DiskVisualizer, screenshot: ScreenshotTool,
  sysexport: SystemInfoExport,
  texttools: TextTools, regex: RegexTester,
  markdown: MarkdownPreview, jsoncsvconv: JsonCsvConverter,
  clipboard: ClipboardManager, fonts: FontPreview,
  passwordgen: PasswordGenerator, quicknotes: QuickNotes,
  // Student tools
  pomodoro: PomodoroTimer, flashcards: FlashcardMaker,
  unitconv: UnitConverter, citation: CitationGenerator,
  wordanalyzer: WordAnalyzer, studytodo: StudyTodo,
  scicalc: ScientificCalc, grades: GradeCalculator,
  timetable: WeeklyTimetable, budget: BudgetTracker,
  settings: null,
}

// All items flat (for search)
const allItems = [
  ...navGroups.flatMap(g => g.items),
  { id: 'settings', label: 'Settings & Widgets', icon: Settings }
]

// ── Total module count ───────────────────────────────────────────
const TOTAL = allItems.length

export default function App() {
  const [activeTab, setActiveTab]   = useState('sorter')
  const [search, setSearch]         = useState('')
  const [moduleKey, setModuleKey]   = useState(0) // for re-mount animation
  const searchRef                   = useRef()

  // Ctrl+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navigate = (id) => {
    setActiveTab(id)
    setModuleKey(k => k + 1)
    setSearch('')
  }

  const filteredGroups = search.trim()
    ? [{ label: 'Results', color: 'rgba(99,102,241,0.7)', items: allItems.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )}]
    : navGroups

  const ActiveModule = moduleMap[activeTab]
  const activeLabel  = allItems.find(i => i.id === activeTab)?.label || ''

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'rgba(8,8,14,0.96)', borderRadius: 12 }}>

      {/* ── Titlebar ─────────────────────────────────────────── */}
      <div className="h-9 flex items-center flex-shrink-0 app-drag-region select-none"
        style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        {/* App name */}
        <div className="flex items-center gap-2 px-4 w-56 flex-shrink-0">
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold tracking-[0.2em] gradient-text uppercase">NexTools</span>
        </div>

        {/* Breadcrumb */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-white/15 text-xs">/</span>
          <span className="text-white/35 text-xs truncate">{activeLabel}</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center no-drag-region">
          {[
            { icon: Minus,    action: 'minimizeWindow',   hover: 'hover:bg-white/10' },
            { icon: Maximize2,action: 'maximizeWindow',   hover: 'hover:bg-white/10' },
            { icon: Maximize, action: 'toggleFullscreen', hover: 'hover:bg-white/10' },
            { icon: X,        action: 'closeWindow',      hover: 'hover:bg-red-500/80', closeBtn: true },
          ].map(({ icon: Icon, action, hover, closeBtn }) => (
            <button key={action} onClick={() => window.electronAPI[action]()}
              className={`w-11 h-9 flex items-center justify-center text-white/25 hover:text-white transition-all ${hover} ${closeBtn ? 'rounded-tr-[10px]' : ''}`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="w-56 flex flex-col flex-shrink-0 no-drag-region"
          style={{ background: 'rgba(0,0,0,0.45)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

          {/* Search box */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools… (Ctrl+K)"
                className="w-full text-xs pl-7 pr-3 py-2 rounded-lg outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'inherit'
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
            {filteredGroups.map(group => (
              <div key={group.label}>
                <div className="flex items-center gap-2 px-2 mb-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: group.color }} />
                  <span className="section-label">{group.label}</span>
                </div>
                <div className="space-y-px">
                  {group.items.map(item => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    return (
                      <SidebarItem
                        key={item.id}
                        label={item.label}
                        icon={<Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                        isActive={isActive}
                        onClick={() => navigate(item.id)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredGroups.length === 1 && filteredGroups[0].items.length === 0 && (
              <div className="text-center py-6">
                <p className="text-white/20 text-xs">No results for "{search}"</p>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="px-2 pb-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <SidebarItem
              label="Settings & Widgets"
              icon={<Settings className="w-3.5 h-3.5 flex-shrink-0" />}
              isActive={activeTab === 'settings'}
              onClick={() => navigate('settings')}
            />
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-[10px] text-white/15">37 tools</span>
              <div className="flex items-center gap-1">
                <span className="pulse-dot dot-green" />
                <span className="text-[10px] text-white/20">Ready</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Content ────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{ background: 'rgba(6,6,12,0.85)' }}>
          <Suspense fallback={<ModuleLoader />}>
            <div key={moduleKey} className="p-7 module-enter">
              {activeTab === 'settings'
                ? <SettingsPanel />
                : ActiveModule
                  ? <ActiveModule />
                  : <EmptyState />
              }
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

// ── Sidebar item component ───────────────────────────────────────
function SidebarItem({ label, icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-xs font-medium transition-all duration-150 group relative"
      style={{
        background: isActive ? 'rgba(99,102,241,0.13)' : 'transparent',
        color: isActive ? 'rgba(165,180,252,1)' : 'rgba(255,255,255,0.35)',
        borderLeft: isActive ? '2px solid rgba(99,102,241,0.75)' : '2px solid transparent',
      }}
      onMouseEnter={e => {
        if (isActive) return
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
      }}
      onMouseLeave={e => {
        if (isActive) return
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
      }}
    >
      <span className={isActive ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/50 transition-colors'}>{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {isActive && <ChevronRight className="w-2.5 h-2.5 text-indigo-400/40 flex-shrink-0" />}
    </button>
  )
}

// ── Empty state ──────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Zap className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-white/30 text-sm font-medium">Select a tool from the sidebar</p>
        <p className="text-white/15 text-xs mt-1">37 tools available · Ctrl+K to search</p>
      </div>
    </div>
  )
}

// ── Module lazy-load fallback ────────────────────────────────────
function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center gap-2.5 text-white/20">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  )
}

// ── Settings panel ───────────────────────────────────────────────
function SettingsPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Settings & Widgets</h2>
      <p className="text-white/40 text-sm mb-8">Manage floating desktop widgets that live outside the main window.</p>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {[
          { name: 'Focus Timer',    desc: 'Pomodoro countdown pill. Drag anywhere on screen.',      widget: 'timer',    hotkey: null },
          { name: 'Dropzone Shelf', desc: 'Screen-edge file bucket for quick drops.',                widget: 'dropzone', hotkey: null },
          { name: 'Omni-Launcher', desc: 'Instant app search bar — available from anywhere.',       widget: null,       hotkey: 'Alt + Space' },
        ].map(w => (
          <div key={w.name} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-white/80 font-semibold text-sm">{w.name}</p>
              {w.widget && (
                <button onClick={() => window.electronAPI.toggleWidget(w.widget)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: 'rgba(165,180,252,1)' }}>
                  Toggle
                </button>
              )}
              {w.hotkey && (
                <kbd className="px-2 py-0.5 rounded-md text-xs font-mono text-white/40"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {w.hotkey}
                </kbd>
              )}
            </div>
            <p className="text-white/30 text-xs leading-relaxed">{w.desc}</p>
          </div>
        ))}
      </div>

      {/* Version info */}
      <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white/60 font-semibold text-sm">NexTools</p>
            <p className="text-white/25 text-xs">27 modules · Electron + React · Windows 11</p>
          </div>
        </div>
      </div>
    </div>
  )
}
