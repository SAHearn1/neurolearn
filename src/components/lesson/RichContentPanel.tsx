import DOMPurify from 'dompurify'
import { useContentSettings } from '../../hooks/useContentSettings'
import { useSettingsStore } from '../../store/settingsStore'

interface RichContentPanelProps {
  content: string
}

export function RichContentPanel({ content }: RichContentPanelProps) {
  const { proseClass, wrapperClass, fontClass } = useContentSettings()
  const screenReaderHints = useSettingsStore((s) => s.accessibility.screen_reader_hints)

  const clean = DOMPurify.sanitize(content)

  return (
    <div className={`${wrapperClass} ${fontClass} rounded-lg`}>
      {screenReaderHints && (
        <p className="sr-only" aria-live="polite">
          Lesson content loaded. Use headings to navigate sections.
        </p>
      )}
      <div
        className={`prose ${proseClass} max-w-none [&_strong]:rounded [&_strong]:bg-brand-100 [&_strong]:px-0.5`}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  )
}
