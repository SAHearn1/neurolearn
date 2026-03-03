import { useState } from 'react'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

interface QuizBlockProps {
  answer: string
  prompt: string
}

export function QuizBlock({ answer, prompt }: QuizBlockProps) {
  const [value, setValue] = useState('')
  const isCorrect = value.trim().toLowerCase() === answer.trim().toLowerCase()

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="font-medium text-slate-900">{prompt}</p>
      <label className="sr-only" htmlFor="quiz-answer">
        Your answer
      </label>
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
        id="quiz-answer"
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type your answer"
        value={value}
      />
      <Button variant="secondary">Check answer</Button>
      {value ? (
        <Alert variant={isCorrect ? 'success' : 'warning'}>
          {isCorrect ? 'Correct!' : 'Try again.'}
        </Alert>
      ) : null}
    </section>
  )
}
