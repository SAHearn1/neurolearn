import { Button } from '../ui/Button'

interface Props {
  regulationLevel: number
  onDismiss: () => void
}

export function RegulationIntervention({ regulationLevel, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <span className="text-3xl" role="img" aria-label="breathing">
            &#x1F32C;
          </span>
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">Take a moment</h2>
        <p className="mb-6 text-sm text-slate-600">
          It looks like you might be feeling frustrated or overwhelmed. That is completely okay.
          Learning hard things takes real effort, and your brain might need a break.
        </p>

        <div className="mb-6 space-y-3 text-left text-sm text-slate-700">
          {regulationLevel < 30 ? (
            <>
              <p className="font-semibold text-amber-700">
                Your regulation is quite low. Let us slow down together.
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Close your eyes and take 5 slow breaths (inhale 4s, hold 4s, exhale 6s)</li>
                <li>Name 5 things you can see, 4 you can hear, 3 you can touch</li>
                <li>Step away from the screen for 2-3 minutes</li>
                <li>Consider resuming this session later if needed — your work is saved</li>
              </ul>
            </>
          ) : regulationLevel < 50 ? (
            <>
              <p>It seems like things are getting challenging. Try one of these:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Take 3 slow, deep breaths</li>
                <li>Stretch your arms above your head</li>
                <li>Look at something across the room for 20 seconds</li>
                <li>Get a drink of water</li>
              </ul>
            </>
          ) : (
            <>
              <p>A quick check-in before continuing:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Roll your shoulders a few times</li>
                <li>Take a deep breath and exhale slowly</li>
                <li>Remind yourself: it is okay to not know yet</li>
              </ul>
            </>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-400">Regulation level: {regulationLevel}/100</p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={onDismiss} variant="primary">
              I am ready to continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
