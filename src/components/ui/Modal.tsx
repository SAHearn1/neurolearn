import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const headingId = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    firstFocusable?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-labelledby={headingId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg" ref={dialogRef}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900" id={headingId}>
            {title}
          </h2>
          <button
            aria-label="Close modal"
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
