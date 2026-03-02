import { useMemo } from 'react'
import type { Profile } from '../types'

const mockProfile: Profile = {
  displayName: 'Ada Learner',
  id: 'demo-user',
  learningStyle: 'visual',
  sensoryPreferences: {
    contrast: 'normal',
    fontSize: 'medium',
    reduceMotion: false,
  },
}

export function useProfile() {
  const profile = useMemo(() => mockProfile, [])
  return { isLoading: false, profile }
}
