import { useEffect, useRef, type ReactNode } from 'react'
import { trapFocus } from '../../lib/focus-manager'

interface ModalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
}

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const cleanup = trapFocus(dialogRef.current)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      cleanup()
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  function handleBackdropClick(event: React.MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div ref={dialogRef} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-900">{title}</h2>
          <button
            aria-label="Close modal"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            onClick={onClose}
            type="button"
          >
            &#x2715;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
