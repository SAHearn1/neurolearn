import { useSettingsStore } from '../store/settingsStore'
import { useProfile } from './useProfile'
import type { LearningStyle } from '../types/profile'

type ContentMode = 'read' | 'listen' | 'watch' | 'practice'

function learningStyleToMode(styles: LearningStyle[]): ContentMode {
  if (styles.includes('auditory')) return 'listen'
  if (styles.includes('kinesthetic')) return 'practice'
  return 'read'
}

export function useContentSettings() {
  const accessibility = useSettingsStore((s) => s.accessibility)
  const { profile } = useProfile()

  const proseClass =
    accessibility.text_size === 'small'
      ? 'prose-sm'
      : accessibility.text_size === 'large'
        ? 'prose-lg'
        : 'prose-base'

  const wrapperClass = accessibility.high_contrast ? 'bg-slate-950 text-white' : ''

  const fontClass = accessibility.dyslexia_font ? 'font-dyslexic' : ''

  const defaultMode: ContentMode = learningStyleToMode(profile?.learning_styles ?? [])

  return { proseClass, wrapperClass, fontClass, defaultMode }
}
