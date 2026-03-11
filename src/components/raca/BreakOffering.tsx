/**
 * BreakOffering — displayed when the availability detector reports 'unavailable'.
 * AI-08: Wire availability-detector into the session lifecycle.
 */

interface BreakOfferingProps {
  reason?: string
  onTakeBreak: () => void
  onContinue: () => void
}

export function BreakOffering({ reason, onTakeBreak, onContinue }: BreakOfferingProps) {
  const message = reason ?? 'Taking a short break can help you think more clearly.'

  return (
    <div
      role="alert"
      aria-label="Break suggestion"
      className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-md"
    >
      <h2 className="mb-2 text-lg font-semibold text-blue-900">⏸ Take a break?</h2>
      <p className="mb-5 text-sm text-blue-800">{message}</p>
      <div className="flex gap-3">
        <button
          type="button"
          aria-label="Take a 5-minute break"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onTakeBreak}
        >
          Take a 5-minute break
        </button>
        <button
          type="button"
          aria-label="I'm okay, continue the session"
          className="rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          onClick={onContinue}
        >
          I'm okay, continue
        </button>
      </div>
    </div>
  )
}
