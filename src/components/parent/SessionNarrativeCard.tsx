// PAR-05: Session Narrative Card
// Renders a single parent-facing session narrative as a warm readable card

import type { ParentNarrative } from '../../hooks/useParentNarratives'

interface Props {
  narrative: ParentNarrative
  childName?: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function SessionNarrativeCard({ narrative, childName }: Props) {
  const heading = childName ? `About ${childName}'s session` : 'About this session'

  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-labelledby={`narrative-heading-${narrative.sessionIdentifier}`}
    >
      <header className="mb-3">
        <h3
          id={`narrative-heading-${narrative.sessionIdentifier}`}
          className="text-base font-semibold text-slate-900"
        >
          {heading}
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">{formatDate(narrative.generatedAt)}</p>
      </header>

      <p className="text-sm leading-relaxed text-slate-700">{narrative.narrativeText}</p>
    </article>
  )
}
