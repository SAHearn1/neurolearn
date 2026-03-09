import { useRef, useState } from 'react'
import { GlossaryPopup } from './GlossaryPopup'

interface GlossaryTermProps {
  term: string
  definition: string
  children: React.ReactNode
}

export function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <span className="relative inline">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-describedby={open ? `gloss-${term}` : undefined}
        className="cursor-pointer underline decoration-dotted decoration-brand-500 underline-offset-2 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        {children}
      </button>
      {open && (
        <GlossaryPopup
          term={term}
          definition={definition}
          onClose={() => setOpen(false)}
          anchorRef={btnRef}
        />
      )}
    </span>
  )
}
