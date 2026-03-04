import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface ReminderConfig {
  studyDurationMinutes: number
  breakDurationMinutes: number
  maxSessionMinutes: number
  hydrationIntervalMinutes: number
}

const DEFAULT_CONFIG: ReminderConfig = {
  studyDurationMinutes: 25,
  breakDurationMinutes: 5,
  maxSessionMinutes: 90,
  hydrationIntervalMinutes: 30,
}

type ReminderType = 'break' | 'hydration' | 'stretch' | 'session-limit'

interface ActiveReminder {
  type: ReminderType
  message: string
  dismissedAt?: number
}

const REMINDER_MESSAGES: Record<ReminderType, string[]> = {
  break: [
    'Time for a short break! Step away from the screen for a few minutes.',
    'Your brain processes information better with regular breaks. Take 5 minutes.',
    'Great study session! Rest your eyes and stretch for a moment.',
  ],
  hydration: ['Remember to drink some water!', 'Stay hydrated — grab a glass of water.'],
  stretch: [
    'Quick stretch break — roll your shoulders and stretch your neck.',
    'Stand up and move around for a minute. Your body will thank you!',
  ],
  'session-limit': [
    'You have been studying for a while. Consider saving your progress and taking a longer break.',
  ],
}

function getRandomMessage(type: ReminderType): string {
  const messages = REMINDER_MESSAGES[type]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function SmartReminders({ config = DEFAULT_CONFIG }: { config?: Partial<ReminderConfig> }) {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null)
  const [sessionStartTime] = useState(() => Date.now())
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const showReminder = useCallback((type: ReminderType) => {
    setActiveReminder({ type, message: getRandomMessage(type) })
  }, [])

  const dismiss = useCallback(() => {
    setActiveReminder(null)
  }, [])

  useEffect(() => {
    if (isPaused) return

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - sessionStartTime) / 60_000

      if (elapsed >= mergedConfig.maxSessionMinutes) {
        showReminder('session-limit')
        return
      }

      const minutesSinceStart = Math.floor(elapsed)

      if (minutesSinceStart > 0 && minutesSinceStart % mergedConfig.studyDurationMinutes === 0) {
        showReminder('break')
      } else if (
        minutesSinceStart > 0 &&
        minutesSinceStart % mergedConfig.hydrationIntervalMinutes === 0
      ) {
        showReminder('hydration')
      }
    }, 60_000) // Check every minute

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, sessionStartTime, mergedConfig, showReminder])

  if (!activeReminder) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button variant="ghost" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? 'Resume reminders' : 'Pause reminders'}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80" role="status" aria-live="polite">
      <Card className="border-brand-200 bg-brand-50 shadow-lg">
        <Alert variant={activeReminder.type === 'session-limit' ? 'warning' : 'info'}>
          {activeReminder.message}
        </Alert>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={dismiss}>
            Dismiss
          </Button>
          {activeReminder.type === 'break' && (
            <Button
              onClick={() => {
                setIsPaused(true)
                dismiss()
              }}
            >
              Start Break
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
