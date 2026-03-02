import { useEffect, useMemo, useState } from 'react'
import type { Profile } from '../types'
import { getSupabaseClient } from '../../utils/supabase/client'

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

interface ProfileRecord {
  avatar_url: string | null
  display_name: string | null
  id: string
  learning_style: Profile['learningStyle'] | null
  sensory_preferences: {
    contrast?: Profile['sensoryPreferences']['contrast']
    fontSize?: Profile['sensoryPreferences']['fontSize']
    reduceMotion?: boolean
  } | null
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile>(mockProfile)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) {
      setIsLoading(false)
      return
    }

    supabase
      .from('profiles')
      .select('id,display_name,avatar_url,learning_style,sensory_preferences')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setIsLoading(false)
          return
        }

        const item = data as ProfileRecord
        setProfile({
          avatarUrl: item.avatar_url ?? undefined,
          displayName: item.display_name ?? mockProfile.displayName,
          id: item.id,
          learningStyle: item.learning_style ?? mockProfile.learningStyle,
          sensoryPreferences: {
            contrast: item.sensory_preferences?.contrast ?? mockProfile.sensoryPreferences.contrast,
            fontSize: item.sensory_preferences?.fontSize ?? mockProfile.sensoryPreferences.fontSize,
            reduceMotion:
              item.sensory_preferences?.reduceMotion ?? mockProfile.sensoryPreferences.reduceMotion,
          },
        })
        setIsLoading(false)
      })
  }, [userId])

  return useMemo(() => ({ isLoading, profile }), [isLoading, profile])
}
