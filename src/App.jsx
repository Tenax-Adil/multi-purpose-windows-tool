import { useState, useEffect, useRef, lazy, Suspense, createContext, useContext, useCallback } from 'react'
import {
  FolderGit2, FileTerminal, RefreshCw, Copy, Globe, Monitor, Archive, Type,
  Wifi, Settings, ChevronRight, Zap, StickyNote, Power, Send, Image, Key,
  Camera, Cpu, HardDrive, FileDown, Minus, Maximize2, X, Hash, FileCode2,
  Scissors, Network, Maximize, Search, Timer, Brain, Calculator, Layers,
  DollarSign, GraduationCap, Calendar, FileSearch, ArrowLeftRight, BookMarked,
  Loader2, Home, Binary, Palette, Shield, Clock, Webhook, Code2, GitCompare,
  Fingerprint, Dumbbell, Droplets, Flame, Activity, Heart, QrCode, Clock4,
  BarChart3, Keyboard, HelpCircle, AlarmClock, CheckSquare
} from 'lucide-react'

const Sorter=lazy(()=>import('./modules/Sorter'))
const Renamer=lazy(()=>import('./modules/Renamer'))
const Converter=lazy(()=>import('./modules/Converter'))
const DuplicateFinder=lazy(()=>import('./modules/DuplicateFinder'))
const SystemDashboard=lazy(()=>import('./modules/SystemDashboard'))
const ClipboardManager=lazy(()=>import('./modules/ClipboardManager'))
const StartupManager=lazy(()=>import('./modules/StartupManager'))
const ArchiveManager=lazy(()=>import('./modules/ArchiveManager'))
const NetworkScanner=lazy(()=>import('./modules/NetworkScanner'))
const TextTools=lazy(()=>import('./modules/TextTools'))
const FontPreview=lazy(()=>import('./modules/FontPreview'))
const FileSender=lazy(()=>import('./modules/FileSender'))
const ProcessManager=lazy(()=>import('./modules/ProcessManager'))
const QuickNotes=lazy(()=>import('./modules/QuickNotes'))
const DiskVisualizer=lazy(()=>import('./modules/DiskVisualizer'))
const BatchResizer=lazy(()=>import('./modules/BatchResizer'))
const PasswordGenerator=lazy(()=>import('./modules/PasswordGenerator'))
const SystemInfoExport=lazy(()=>import('./modules/SystemInfoExport'))
const ScreenshotTool=lazy(()=>import('./modules/ScreenshotTool'))
const RegexTester=lazy(()=>import('./modules/RegexTester'))
const MarkdownPreview=lazy(()=>import('./modules/MarkdownPreview'))
const JsonCsvConverter=lazy(()=>import('./modules/JsonCsvConverter'))
const FileShredder=lazy(()=>import('./modules/FileShredder'))
const WakeOnLan=lazy(()=>import('./modules/WakeOnLan'))
const PortScanner=lazy(()=>import('./modules/PortScanner'))
const ImageCompressor=lazy(()=>import('./modules/ImageCompressor'))
const PomodoroTimer=lazy(()=>import('./modules/PomodoroTimer'))
const FlashcardMaker=lazy(()=>import('./modules/FlashcardMaker'))
const UnitConverter=lazy(()=>import('./modules/UnitConverter'))
const CitationGenerator=lazy(()=>import('./modules/CitationGenerator'))
const WordAnalyzer=lazy(()=>import('./modules/WordAnalyzer'))
const StudyTodo=lazy(()=>import('./modules/StudyTodo'))
const ScientificCalc=lazy(()=>import('./modules/ScientificCalc'))
const GradeCalculator=lazy(()=>import('./modules/GradeCalculator'))
const WeeklyTimetable=lazy(()=>import('./modules/WeeklyTimetable'))
const BudgetTracker=lazy(()=>import('./modules/BudgetTracker'))
const BaseConverter=lazy(()=>import('./modules/BaseConverter'))
const ColorStudio=lazy(()=>import('./modules/ColorStudio'))
const JwtDecoder=lazy(()=>import('./modules/JwtDecoder'))
const CronBuilder=lazy(()=>import('./modules/CronBuilder'))
const HttpTester=lazy(()=>import('./modules/HttpTester'))
const CodeSnippets=lazy(()=>import('./modules/CodeSnippets'))
const DiffViewer=lazy(()=>import('./modules/DiffViewer'))
const UuidGenerator=lazy(()=>import('./modules/UuidGenerator'))
const BodyCalculator=lazy(()=>import('./modules/BodyCalculator'))
const WorkoutLog=lazy(()=>import('./modules/WorkoutLog'))
const WaterTracker=lazy(()=>import('./modules/WaterTracker'))
const MacroCalc=lazy(()=>import('./modules/MacroCalc'))
const WorkoutTimer=lazy(()=>import('./modules/WorkoutTimer'))
const HabitTracker=lazy(()=>import('./modules/HabitTracker'))
const StudyAnalytics=lazy(()=>import('./modules/StudyAnalytics'))
const TypingTest=lazy(()=>import('./modules/TypingTest'))
const RandomQuiz=lazy(()=>import('./modules/RandomQuiz'))
const HomeworkDeadline=lazy(()=>import('./modules/HomeworkDeadline'))
const MultiStopwatch=lazy(()=>import('./modules/MultiStopwatch'))
const QrStudio=lazy(()=>import('./modules/QrStudio'))

const navGroups = [
  { label:'File Tools', color:'#6366f1', items:[
    {id:'sorter',label:'Smart Sorter',icon:FolderGit2},{id:'renamer',label:'Bulk Renamer',icon:FileTerminal},
    {id:'converter',label:'File Converter',icon:RefreshCw},{id:'batchresizer',label:'Batch Resizer',icon:Image},
    {id:'compressor',label:'Image Compressor',icon:Layers},{id:'duplicates',label:'Duplicate Finder',icon:Copy},
    {id:'shredder',label:'File Shredder',icon:Scissors},{id:'archives',label:'Archive Manager',icon:Archive},
    {id:'filesender',label:'WiFi File Sender',icon:Send},
  ]},
  { label:'System', color:'#10b981', items:[
    {id:'dashboard',label:'System Dashboard',icon:Monitor},{id:'processes',label:'Process Manager',icon:Cpu},
    {id:'startup',label:'Startup Manager',icon:Power},{id:'network',label:'Network Scanner',icon:Wifi},
    {id:'portscanner',label:'Port Scanner',icon:Network},{id:'wol',label:'Wake-on-LAN',icon:Zap},
    {id:'diskvisualizer',label:'Disk Visualizer',icon:HardDrive},{id:'screenshot',label:'Screenshot Tool',icon:Camera},
    {id:'sysexport',label:'System Report',icon:FileDown},
  ]},
  { label:'Tools', color:'#f59e0b', items:[
    {id:'texttools',label:'Text Tools',icon:Globe},{id:'regex',label:'Regex Tester',icon:Hash},
    {id:'markdown',label:'Markdown Preview',icon:FileCode2},{id:'jsoncsvconv',label:'JSON ↔ CSV',icon:RefreshCw},
    {id:'clipboard',label:'Clipboard Manager',icon:Copy},{id:'fonts',label:'Font Preview',icon:Type},
    {id:'passwordgen',label:'Password Generator',icon:Key},{id:'quicknotes',label:'Quick Notes',icon:StickyNote},
  ]},
  { label:'Student', color:'#a855f7', items:[
    {id:'pomodoro',label:'Pomodoro Timer',icon:Timer},{id:'flashcards',label:'Flashcard Maker',icon:Brain},
    {id:'unitconv',label:'Unit Converter',icon:ArrowLeftRight},{id:'citation',label:'Citation Generator',icon:BookMarked},
    {id:'wordanalyzer',label:'Word Analyzer',icon:FileSearch},{id:'studytodo',label:'Study To-Do',icon:GraduationCap},
    {id:'scicalc',label:'Scientific Calc',icon:Calculator},{id:'grades',label:'Grade Calculator',icon:GraduationCap},
    {id:'timetable',label:'Timetable',icon:Calendar},{id:'budget',label:'Budget Tracker',icon:DollarSign},
    {id:'habits',label:'Habit Tracker',icon:CheckSquare},{id:'studyanalytics',label:'Study Analytics',icon:BarChart3},
    {id:'typingtest',label:'Typing Speed Test',icon:Keyboard},{id:'randomquiz',label:'Random Quiz',icon:HelpCircle},
    {id:'homework',label:'Homework Deadlines',icon:AlarmClock},
  ]},
  { label:'Engineer', color:'#3b82f6', items:[
    {id:'baseconv',label:'Base Converter',icon:Binary},{id:'colorstudio',label:'Color Studio',icon:Palette},
    {id:'jwtdecoder',label:'JWT Decoder',icon:Shield},{id:'cronbuilder',label:'Cron Builder',icon:Clock},
    {id:'httptester',label:'HTTP Tester',icon:Webhook},{id:'codesnippets',label:'Code Snippets',icon:Code2},
    {id:'diffviewer',label:'Diff Viewer',icon:GitCompare},{id:'uuidgen',label:'UUID Generator',icon:Fingerprint},
  ]},
  { label:'Fitness', color:'#ef4444', items:[
    {id:'bodycalc',label:'Body Calculator',icon:Heart},{id:'workoutlog',label:'Workout Log',icon:Dumbbell},
    {id:'watertracker',label:'Water Tracker',icon:Droplets},{id:'macrocalc',label:'Macro Calculator',icon:Flame},
    {id:'workouttimer',label:'Workout Timer',icon:Activity},
  ]},
  { label:'General', color:'#14b8a6', items:[
    {id:'multistopwatch',label:'Multi Stopwatch',icon:Clock4},{id:'qrstudio',label:'QR Code Studio',icon:QrCode},
  ]},
]

const moduleMap = {
  sorter:Sorter,renamer:Renamer,converter:Converter,batchresizer:BatchResizer,
  compressor:ImageCompressor,duplicates:DuplicateFinder,shredder:FileShredder,
  archives:ArchiveManager,filesender:FileSender,dashboard:SystemDashboard,
  processes:ProcessManager,startup:StartupManager,network:NetworkScanner,
  portscanner:PortScanner,wol:WakeOnLan,diskvisualizer:DiskVisualizer,
  screenshot:ScreenshotTool,sysexport:SystemInfoExport,texttools:TextTools,
  regex:RegexTester,markdown:MarkdownPreview,jsoncsvconv:JsonCsvConverter,
  clipboard:ClipboardManager,fonts:FontPreview,passwordgen:PasswordGenerator,
  quicknotes:QuickNotes,pomodoro:PomodoroTimer,flashcards:FlashcardMaker,
  unitconv:UnitConverter,citation:CitationGenerator,wordanalyzer:WordAnalyzer,
  studytodo:StudyTodo,scicalc:ScientificCalc,grades:GradeCalculator,
  timetable:WeeklyTimetable,budget:BudgetTracker,
  habits:HabitTracker,studyanalytics:StudyAnalytics,typingtest:TypingTest,
  randomquiz:RandomQuiz,homework:HomeworkDeadline,
  baseconv:BaseConverter,colorstudio:ColorStudio,jwtdecoder:JwtDecoder,
  cronbuilder:CronBuilder,httptester:HttpTester,codesnippets:CodeSnippets,
  diffviewer:DiffViewer,uuidgen:UuidGenerator,
  bodycalc:BodyCalculator,workoutlog:WorkoutLog,watertracker:WaterTracker,
  macrocalc:MacroCalc,workouttimer:WorkoutTimer,
  multistopwatch:MultiStopwatch,qrstudio:QrStudio,
}

const allItems = navGroups.flatMap(g=>g.items)
const TOTAL = allItems.length

// Toast Context
const ToastCtx = createContext()
export function useToast() { return useContext(ToastCtx) }

function ToastProvider({children}) {
  const [toasts,setToasts]=useState([])
  const add=useCallback((msg,type='success')=>{
    const id=Date.now()
    setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)
  },[])
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{position:'fixed',top:16,right:16,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
        {toasts.map(t=>(
          <div key={t.id} className="toast-enter" style={{
            background:t.type==='error'?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.15)',
            border:`1px solid ${t.type==='error'?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'}`,
            color:t.type==='error'?'#fca5a5':'#6ee7b7',
            padding:'10px 18px',borderRadius:12,fontSize:13,fontWeight:500,minWidth:220,
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
  const [activeTab,setActiveTab]=useState(null)
  const [search,setSearch]=useState('')
  const [moduleKey,setModuleKey]=useState(0)
  const [collapsed,setCollapsed]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('nex_collapsed'))||[]}catch{return[]}
  })
  const [recent,setRecent]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('nex_recent'))||[]}catch{return[]}
  })
  const searchRef=useRef()

  useEffect(()=>{
    const h=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();searchRef.current?.focus()}}
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)
  },[])

  const navigate=id=>{
    setActiveTab(id);setModuleKey(k=>k+1);setSearch('')
    if(id&&id!=='settings'){
      const next=[id,...recent.filter(r=>r!==id)].slice(0,6)
      setRecent(next);localStorage.setItem('nex_recent',JSON.stringify(next))
    }
  }

  const toggleGroup=label=>{
    const next=collapsed.includes(label)?collapsed.filter(l=>l!==label):[...collapsed,label]
    setCollapsed(next);localStorage.setItem('nex_collapsed',JSON.stringify(next))
  }

  const filtered=search.trim()
    ?[{label:'Results',color:'#6366f1',items:allItems.filter(i=>i.label.toLowerCase().includes(search.toLowerCase()))}]
    :navGroups

  const ActiveModule=activeTab?moduleMap[activeTab]:null
  const activeItem=allItems.find(i=>i.id===activeTab)
  const activeGroup=navGroups.find(g=>g.items.some(i=>i.id===activeTab))

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{background:'#08080f',borderRadius:12}}>
      {/* Titlebar */}
      <div className="h-9 flex items-center flex-shrink-0 app-drag-region select-none"
        style={{background:'rgba(0,0,0,0.55)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="flex items-center gap-2 px-4 w-[220px] flex-shrink-0">
          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{background:'linear-gradient(135deg,#6366f1,#a855f7)'}}>
            <Zap className="w-3 h-3 text-white"/>
          </div>
          <span className="text-xs font-bold tracking-[0.2em] gradient-text uppercase">NexTools</span>
        </div>
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {activeGroup&&<><span className="text-white/15 text-xs">/</span>
          <span className="text-xs" style={{color:activeGroup.color,opacity:0.6}}>{activeGroup.label}</span></>}
          {activeItem&&<><span className="text-white/15 text-xs">/</span>
          <span className="text-white/50 text-xs truncate">{activeItem.label}</span></>}
          {!activeTab&&<><span className="text-white/15 text-xs">/</span><span className="text-white/30 text-xs">Home</span></>}
        </div>
        <div className="flex items-center no-drag-region">
          {[{i:Minus,a:'minimizeWindow'},{i:Maximize2,a:'maximizeWindow'},{i:Maximize,a:'toggleFullscreen'},{i:X,a:'closeWindow',c:true}]
            .map(({i:Icon,a,c})=>(
            <button key={a} onClick={()=>window.electronAPI[a]()}
              className={`w-11 h-9 flex items-center justify-center text-white/25 hover:text-white transition-all ${c?'hover:bg-red-500/80 rounded-tr-[10px]':'hover:bg-white/10'}`}>
              <Icon className="w-3.5 h-3.5"/>
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-[220px] flex flex-col flex-shrink-0 no-drag-region"
          style={{background:'rgba(0,0,0,0.4)',borderRight:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none"/>
              <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search… Ctrl+K" className="input-base text-xs !pl-7 !py-2 !rounded-lg !bg-white/[0.03] !border-white/[0.07]"
                style={{fontFamily:'inherit'}}/>
              {search&&<button onClick={()=>setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"><X className="w-3 h-3"/></button>}
            </div>
          </div>

          {/* Home button */}
          <div className="px-2 pb-1">
            <button onClick={()=>{setActiveTab(null);setModuleKey(k=>k+1)}}
              className={`sidebar-item ${!activeTab?'active':''}`}
              style={!activeTab?{borderLeftColor:'#6366f1',background:'rgba(99,102,241,0.12)',color:'rgba(255,255,255,0.9)'}:{}}>
              <Home className="w-3.5 h-3.5 flex-shrink-0"/><span className="flex-1 text-left">Dashboard</span>
            </button>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto px-2 pb-2">
            {filtered.map(group=>{
              const isCollapsed=collapsed.includes(group.label)&&!search.trim()
              return (
                <div key={group.label} className="mb-1">
                  <button onClick={()=>toggleGroup(group.label)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 mb-0.5 group cursor-pointer" style={{background:'none',border:'none'}}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:group.color}}/>
                    <span className="section-label flex-1 text-left">{group.label}</span>
                    <span className="text-[9px] text-white/15 mr-1">{group.items.length}</span>
                    <ChevronRight className={`w-2.5 h-2.5 text-white/15 chevron ${isCollapsed?'':'open'}`}/>
                  </button>
                  <div className="group-body" style={{maxHeight:isCollapsed?0:group.items.length*34+8}}>
                    <div className="space-y-px pb-1">
                      {group.items.map(item=>{
                        const Icon=item.icon; const isAct=activeTab===item.id
                        return (
                          <button key={item.id} onClick={()=>navigate(item.id)}
                            className={`sidebar-item ${isAct?'active':''}`}
                            style={isAct?{borderLeftColor:group.color,background:`${group.color}18`,color:'rgba(255,255,255,0.9)'}:{}}>
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={isAct?{color:group.color}:{}}/>
                            <span className="flex-1 text-left truncate">{item.label}</span>
                            {isAct&&<ChevronRight className="w-2.5 h-2.5 flex-shrink-0" style={{color:group.color,opacity:0.4}}/>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length===1&&filtered[0].items.length===0&&(
              <div className="text-center py-6"><p className="text-white/20 text-xs">No results for "{search}"</p></div>
            )}
          </nav>

          {/* Footer */}
          <div className="px-2 pb-2 pt-1" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <button onClick={()=>navigate('settings')} className={`sidebar-item ${activeTab==='settings'?'active':''}`}>
              <Settings className="w-3.5 h-3.5 flex-shrink-0"/><span className="flex-1 text-left">Settings</span>
            </button>
            <div className="flex items-center justify-between px-3 pt-1.5">
              <span className="text-[10px] text-white/15">{TOTAL} tools</span>
              <div className="flex items-center gap-1"><span className="pulse-dot dot-green"/><span className="text-[10px] text-white/20">Ready</span></div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{background:'rgba(8,8,15,0.9)'}}>
          <Suspense fallback={<ModuleLoader/>}>
            <div key={moduleKey} className="p-7 module-enter">
              {activeTab==='settings'?<SettingsPanel/>
                :activeTab&&ActiveModule?<ActiveModule/>
                :<Dashboard recent={recent} navigate={navigate}/>}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

function ModuleLoader(){
  return <div className="flex items-center justify-center h-48">
    <div className="flex items-center gap-2.5 text-white/20"><Loader2 className="w-4 h-4 animate-spin"/><span className="text-sm">Loading…</span></div>
  </div>
}

function Dashboard({recent,navigate}){
  const hour=new Date().getHours()
  const greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'
  const recentItems=recent.map(id=>allItems.find(i=>i.id===id)).filter(Boolean).slice(0,6)
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/90 mb-1">{greeting} 👋</h1>
        <p className="text-white/35 text-sm">Your productivity suite — {TOTAL} tools ready</p>
      </div>
      {recentItems.length>0&&(
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Recently Used</h2>
          <div className="grid grid-cols-3 gap-3">
            {recentItems.map((item,i)=>{
              const Icon=item.icon; const group=navGroups.find(g=>g.items.some(x=>x.id===item.id))
              return (
                <button key={item.id} onClick={()=>navigate(item.id)}
                  className="card-elevated p-4 text-left cursor-pointer dash-card-anim"
                  style={{animationDelay:`${i*50}ms`,borderLeft:`2px solid ${group?.color||'#6366f1'}`}}>
                  <Icon className="w-5 h-5 mb-2" style={{color:group?.color||'#6366f1'}}/>
                  <p className="text-white/80 text-sm font-medium">{item.label}</p>
                  <p className="text-white/25 text-[10px] mt-0.5">{group?.label}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}
      <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">All Categories</h2>
      <div className="grid grid-cols-2 gap-3">
        {navGroups.map((g,i)=>(
          <div key={g.label} className="card-elevated p-4 dash-card-anim" style={{animationDelay:`${i*60}ms`}}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{background:g.color}}/>
              <span className="text-white/60 text-sm font-semibold">{g.label}</span>
              <span className="text-white/20 text-[10px] ml-auto">{g.items.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {g.items.slice(0,4).map(item=>(
                <button key={item.id} onClick={()=>navigate(item.id)}
                  className="text-[10px] px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                  style={{background:`${g.color}12`,color:`${g.color}`,border:`1px solid ${g.color}25`}}>
                  {item.label}
                </button>
              ))}
              {g.items.length>4&&<span className="text-[10px] text-white/20 px-1">+{g.items.length-4}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel(){
  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Settings & Widgets</h2>
      <p className="text-white/40 text-sm mb-8">Manage floating desktop widgets.</p>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {[{name:'Focus Timer',desc:'Pomodoro countdown pill.',widget:'timer'},
          {name:'Dropzone Shelf',desc:'Screen-edge file bucket.',widget:'dropzone'},
          {name:'Omni-Launcher',desc:'Instant search — Alt+Space.',widget:null,hotkey:'Alt+Space'}
        ].map(w=>(
          <div key={w.name} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-white/80 font-semibold text-sm">{w.name}</p>
              {w.widget&&<button onClick={()=>window.electronAPI.toggleWidget(w.widget)}
                className="px-3 py-1 rounded-lg text-xs font-semibold btn-ghost" style={{color:'#818cf8'}}>Toggle</button>}
              {w.hotkey&&<kbd className="px-2 py-0.5 rounded-md text-xs font-mono text-white/40"
                style={{background:'rgba(0,0,0,0.5)',border:'1px solid rgba(255,255,255,0.1)'}}>{w.hotkey}</kbd>}
            </div>
            <p className="text-white/30 text-xs leading-relaxed">{w.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 pt-6" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#6366f1,#a855f7)'}}>
            <Zap className="w-4 h-4 text-white"/>
          </div>
          <div><p className="text-white/60 font-semibold text-sm">NexTools</p>
            <p className="text-white/25 text-xs">{TOTAL} modules · Electron + React</p></div>
        </div>
      </div>
    </div>
  )
}
