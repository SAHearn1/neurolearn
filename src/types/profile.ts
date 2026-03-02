export interface SensoryPreferences {
  contrast: 'normal' | 'high'
  fontSize: 'small' | 'medium' | 'large'
  reduceMotion: boolean
}

export interface Profile {
  avatarUrl?: string
  displayName: string
  id: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic'
  sensoryPreferences: SensoryPreferences
}
