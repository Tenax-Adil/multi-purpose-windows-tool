import { useState } from 'react'

function generateQuestions(text) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15)
  return sentences.slice(0, 10).map((s, i) => {
    const words = s.split(' ')
    if (words.length < 4) return null
    const hideIdx = Math.floor(Math.random() * (words.length - 1)) + 1
    const answer = words[hideIdx]
    const question = words.map((w, j) => j === hideIdx ? '_____' : w).join(' ')
    return { id: i, question: question + '?', answer, userAnswer: '' }
  }).filter(Boolean)
}

export default function RandomQuiz() {
  const [notes, setNotes] = useState('')
  const [questions, setQuestions] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const generate = () => {
    if (!notes.trim()) return
    setQuestions(generateQuestions(notes).map(q => ({ ...q, userAnswer: '' })))
    setSubmitted(false)
  }

  const update = (id, val) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, userAnswer: val } : q))

  const submit = () => setSubmitted(true)

  const score = questions.filter(q => q.userAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim()).length
  const total = questions.length

  return (
    <div>
      <h2 className="text-2xl font-bold text-white/90 mb-1">Random Quiz</h2>
      <p className="text-white/40 text-sm mb-6">Paste your notes → get quizzed on them</p>

      {questions.length === 0 ? (
        <>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={8}
            className="input-base text-sm mb-4" style={{ resize: 'vertical' }}
            placeholder="Paste your study notes here. The more sentences, the better the quiz…" />
          <button onClick={generate} disabled={!notes.trim()} className="btn-primary px-5 py-2 text-sm">Generate Quiz</button>
        </>
      ) : (
        <>
          {submitted && (
            <div className="card-elevated p-4 mb-4 text-center" style={{ borderTop: `2px solid ${score === total ? '#10b981' : '#f59e0b'}` }}>
              <p className="text-2xl font-bold" style={{ color: score === total ? '#34d399' : '#fbbf24' }}>{score}/{total}</p>
              <p className="text-xs text-white/30">correct answers</p>
            </div>
          )}
          <div className="space-y-3 mb-4">
            {questions.map((q, i) => {
              const isCorrect = submitted && q.userAnswer.toLowerCase().trim() === q.answer.toLowerCase().trim()
              const isWrong = submitted && !isCorrect
              return (
                <div key={q.id} className="glass-card p-4" style={isWrong ? { borderLeft: '2px solid #ef4444' } : isCorrect ? { borderLeft: '2px solid #10b981' } : {}}>
                  <p className="text-sm text-white/70 mb-2"><span className="text-white/25 mr-2">Q{i + 1}.</span>{q.question}</p>
                  <input value={q.userAnswer} onChange={e => update(q.id, e.target.value)}
                    className="input-base text-sm" placeholder="Your answer…" disabled={submitted} />
                  {isWrong && <p className="text-xs text-red-400/70 mt-1">Answer: {q.answer}</p>}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            {!submitted && <button onClick={submit} className="btn-primary px-5 py-2 text-sm">Submit</button>}
            <button onClick={() => { setQuestions([]); setSubmitted(false) }} className="btn-ghost px-4 py-2 text-sm">New Quiz</button>
          </div>
        </>
      )}
    </div>
  )
}
