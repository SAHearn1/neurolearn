import { useState } from 'react'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'

export interface Question {
  prompt: string
  options: string[]
  correct: number
  explanation?: string
}

interface MultipleChoiceQuizProps {
  questions: Question[]
}

export function MultipleChoiceQuiz({ questions }: MultipleChoiceQuizProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[current]

  const handleCheck = () => {
    if (selected === null) return
    setSubmitted(true)
    if (selected === q.correct) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setSubmitted(false)
    }
  }

  const handleRetake = () => {
    setCurrent(0)
    setSelected(null)
    setSubmitted(false)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-4xl font-bold text-brand-600">{pct}%</p>
        <p className="text-lg font-semibold text-slate-800">
          {score} / {questions.length} correct
        </p>
        <p className="text-sm text-slate-500">
          {pct >= 80
            ? 'Great job! You have a strong understanding of this lesson.'
            : 'Keep practicing! Review the lesson content and try again.'}
        </p>
        <Button onClick={handleRetake}>Retake Quiz</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Question {current + 1} of {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <p className="text-base font-semibold text-slate-900">{q.prompt}</p>

      <fieldset className="space-y-2">
        <legend className="sr-only">Choose an answer</legend>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct
          const isSelected = i === selected
          let borderClass = 'border-slate-200'
          if (submitted) {
            if (isCorrect) borderClass = 'border-green-500 bg-green-50'
            else if (isSelected) borderClass = 'border-red-400 bg-red-50'
          } else if (isSelected) {
            borderClass = 'border-brand-500 bg-brand-50'
          }
          return (
            <label
              key={i}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${borderClass}`}
            >
              <input
                type="radio"
                name="quiz-option"
                value={i}
                checked={isSelected}
                onChange={() => !submitted && setSelected(i)}
                disabled={submitted}
                className="h-4 w-4 accent-brand-500"
              />
              {opt}
            </label>
          )
        })}
      </fieldset>

      {submitted && (
        <Alert variant={selected === q.correct ? 'success' : 'warning'}>
          {selected === q.correct ? (
            <>
              <strong>Correct!</strong>
              {q.explanation && <> {q.explanation}</>}
            </>
          ) : (
            <>
              <strong>Not quite.</strong>{' '}
              {q.explanation ?? `The correct answer is: ${q.options[q.correct]}`}
            </>
          )}
        </Alert>
      )}

      <div className="flex gap-2">
        {!submitted ? (
          <Button onClick={handleCheck} disabled={selected === null}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {current + 1 >= questions.length ? 'See Results' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  )
}
