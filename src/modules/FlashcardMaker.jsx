import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, XCircle, BookOpen, Pencil, ArrowLeft, RotateCcw } from 'lucide-react'

const COLORS = [
  'rgba(99,102,241,0.8)', 'rgba(52,211,153,0.8)', 'rgba(251,191,36,0.8)',
  'rgba(248,113,113,0.8)', 'rgba(168,85,247,0.8)', 'rgba(59,130,246,0.8)'
]

const STORAGE_KEY = 'nextools_flashcards_v2'

function loadDecks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveDecks(decks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

// ── Home View ─────────────────────────────────────────────────
function HomeView({ decks, setDecks, onEdit, onStudy }) {
  const [newName, setNewName] = useState('')

  const createDeck = () => {
    if (!newName.trim()) return
    const deck = {
      id: Date.now(),
      name: newName.trim(),
      color: COLORS[decks.length % COLORS.length],
      cards: []
    }
    const updated = [...decks, deck]
    setDecks(updated)
    saveDecks(updated)
    setNewName('')
    onEdit(deck.id)
  }

  const deleteDeck = (id) => {
    const updated = decks.filter(d => d.id !== id)
    setDecks(updated)
    saveDecks(updated)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Flashcard Maker</h2>
      <p className="text-white/40 text-sm mb-6">Create decks and quiz yourself. Click a card to reveal the answer.</p>

      {/* Create deck */}
      <div className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createDeck()}
          placeholder="New deck name (e.g. Biology Chapter 3)…"
          className="input-base flex-1"
        />
        <button onClick={createDeck} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />Create
        </button>
      </div>

      {/* Deck grid */}
      {decks.length === 0 ? (
        <div className="text-center py-16 text-white/20">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No decks yet. Create your first one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {decks.map(deck => (
            <div key={deck.id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: deck.color }} />
                <button
                  onClick={() => deleteDeck(deck.id)}
                  className="text-white/15 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-white/80 font-semibold mb-1 truncate">{deck.name}</p>
              <p className="text-white/30 text-xs mb-4">
                {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(deck.id)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <Pencil className="w-3 h-3" />Edit
                </button>
                <button
                  onClick={() => deck.cards.length > 0 && onStudy(deck.id)}
                  disabled={deck.cards.length === 0}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: `${deck.color}22`, border: `1px solid ${deck.color}66`, color: deck.color }}
                >
                  <BookOpen className="w-3 h-3" />Study
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Edit View ─────────────────────────────────────────────────
function EditView({ deck, decks, setDecks, onBack }) {
  const [q, setQ] = useState('')
  const [a, setA] = useState('')

  const addCard = () => {
    if (!q.trim() || !a.trim()) return
    const card = { id: Date.now(), q: q.trim(), a: a.trim() }
    const updated = decks.map(d =>
      d.id === deck.id ? { ...d, cards: [...d.cards, card] } : d
    )
    setDecks(updated)
    saveDecks(updated)
    setQ('')
    setA('')
  }

  const deleteCard = (cardId) => {
    const updated = decks.map(d =>
      d.id === deck.id ? { ...d, cards: d.cards.filter(c => c.id !== cardId) } : d
    )
    setDecks(updated)
    saveDecks(updated)
  }

  // Get fresh deck data each render
  const currentDeck = decks.find(d => d.id === deck.id) || deck

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <div className="w-1 h-4 bg-white/10 rounded-full" />
        <h2 className="text-xl font-bold text-white/90">{currentDeck.name}</h2>
        <span className="text-white/30 text-sm">({currentDeck.cards.length} cards)</span>
      </div>

      {/* Add card form */}
      <div className="glass-card p-5 mb-5 space-y-3">
        <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Add New Card</p>
        <div>
          <p className="text-xs text-white/25 mb-1.5">Question</p>
          <textarea
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Type the question here…"
            rows={2}
            style={{
              width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'rgba(226,232,240,0.8)',
              outline: 'none', resize: 'none', fontFamily: 'inherit'
            }}
          />
        </div>
        <div>
          <p className="text-xs text-white/25 mb-1.5">Answer</p>
          <textarea
            value={a}
            onChange={e => setA(e.target.value)}
            placeholder="Type the answer here…"
            rows={2}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) addCard() }}
            style={{
              width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'rgba(226,232,240,0.8)',
              outline: 'none', resize: 'none', fontFamily: 'inherit'
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/20">Ctrl+Enter to add</p>
          <button onClick={addCard} disabled={!q.trim() || !a.trim()}
            className="btn-primary px-5 py-2 text-sm disabled:opacity-30">
            Add Card
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {currentDeck.cards.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm">
            No cards yet — add the first one above
          </div>
        )}
        {currentDeck.cards.map((card, i) => (
          <div key={card.id} className="flex gap-4 items-start px-4 py-3.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-white/20 text-xs font-mono w-5 flex-shrink-0 pt-0.5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm font-medium leading-snug">{card.q}</p>
              <p className="text-white/35 text-xs mt-1 leading-snug">{card.a}</p>
            </div>
            <button onClick={() => deleteCard(card.id)}
              className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Study View ─────────────────────────────────────────────────
function StudyView({ deck, decks, onBack }) {
  const currentDeck = decks.find(d => d.id === deck.id) || deck
  const [idx, setIdx]       = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong]     = useState(0)

  const total = currentDeck.cards.length
  const card  = currentDeck.cards[idx]
  const done  = idx >= total

  const next = (wasCorrect) => {
    if (wasCorrect) setCorrect(c => c + 1)
    else setWrong(w => w + 1)
    setFlipped(false)
    setIdx(i => i + 1)
  }

  const restart = () => { setIdx(0); setFlipped(false); setCorrect(0); setWrong(0) }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <div className="w-1 h-4 bg-white/10 rounded-full" />
        <h2 className="text-xl font-bold text-white/90">{currentDeck.name}</h2>
      </div>

      {done ? (
        <div className="glass-card p-10 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-white/80 text-xl font-bold mb-1">Session Complete!</p>
          <p className="text-white/30 text-sm mb-6">{total} cards reviewed</p>
          <div className="flex justify-center gap-10 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{correct}</p>
              <p className="text-white/30 text-xs mt-0.5">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{wrong}</p>
              <p className="text-white/30 text-xs mt-0.5">Wrong</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-400">{Math.round(correct / total * 100)}%</p>
              <p className="text-white/30 text-xs mt-0.5">Score</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={restart} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />Study Again
            </button>
            <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Back to Decks
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-white/30 mb-3">
            <span>{idx + 1} of {total}</span>
            <span className="flex gap-4">
              <span className="text-green-400">✓ {correct}</span>
              <span className="text-red-400">✗ {wrong}</span>
            </span>
          </div>
          <div className="h-1 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(idx / total) * 100}%`, background: currentDeck.color }} />
          </div>

          {/* Card */}
          <div
            onClick={() => setFlipped(f => !f)}
            className="rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 select-none mb-5"
            style={{
              background: flipped ? 'rgba(52,211,153,0.08)' : 'rgba(99,102,241,0.08)',
              border: `1px solid ${flipped ? 'rgba(52,211,153,0.3)' : 'rgba(99,102,241,0.3)'}`,
              minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <p className="text-xs uppercase tracking-[0.15em] mb-4"
              style={{ color: flipped ? 'rgba(52,211,153,0.6)' : 'rgba(99,102,241,0.6)' }}>
              {flipped ? 'Answer' : 'Question — click to reveal'}
            </p>
            <p className="text-white/85 text-xl font-medium leading-relaxed max-w-md">
              {flipped ? card.a : card.q}
            </p>
          </div>

          {/* Action buttons */}
          {flipped ? (
            <div className="flex gap-3">
              <button onClick={() => next(false)}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: 'rgb(248,113,113)' }}>
                <XCircle className="w-4 h-4" />Didn't Know
              </button>
              <button onClick={() => next(true)}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: 'rgb(52,211,153)' }}>
                <CheckCircle2 className="w-4 h-4" />Got It!
              </button>
            </div>
          ) : (
            <p className="text-center text-white/20 text-sm">
              Click the card above to reveal the answer
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function FlashcardMaker() {
  const [decks, setDecks]       = useState(loadDecks)
  const [view, setView]         = useState('home') // 'home' | 'edit' | 'study'
  const [activeDeckId, setActiveDeckId] = useState(null)

  const activeDeck = decks.find(d => d.id === activeDeckId) || null

  const goEdit  = (id) => { setActiveDeckId(id); setView('edit') }
  const goStudy = (id) => { setActiveDeckId(id); setView('study') }
  const goHome  = ()   => { setView('home'); setActiveDeckId(null) }

  if (view === 'edit' && activeDeck) {
    return <EditView deck={activeDeck} decks={decks} setDecks={setDecks} onBack={goHome} />
  }
  if (view === 'study' && activeDeck) {
    return <StudyView deck={activeDeck} decks={decks} onBack={goHome} />
  }
  return <HomeView decks={decks} setDecks={setDecks} onEdit={goEdit} onStudy={goStudy} />
}
