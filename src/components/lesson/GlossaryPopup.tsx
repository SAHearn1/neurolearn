import { useEffect, useRef } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

interface GlossaryPopupProps {
  term: string
  definition: string
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export function GlossaryPopup({ term, definition, onClose, anchorRef }: GlossaryPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const dyslexiaFont = useSettingsStore((s) => s.accessibility.dyslexia_font)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    popupRef.current?.focus()
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose, anchorRef])

  return (
    <div
      ref={popupRef}
      role="tooltip"
      tabIndex={-1}
      aria-label={`Definition of ${term}`}
      className={`absolute z-30 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg outline-none ${dyslexiaFont ? 'font-dyslexic' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-slate-900">{term}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close definition"
          className="flex-shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{definition}</p>
    </div>
  )
}
