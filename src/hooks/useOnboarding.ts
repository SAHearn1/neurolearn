import { useState } from 'react'

const ONBOARDING_KEY = 'neurolearn_onboarding_complete'

/**
 * Manages the first-run onboarding state.
 * Returns showOnboarding=true the first time a learner visits the dashboard
 * (before they have completed onboarding). Sets the localStorage flag on completion.
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) !== 'true'
    } catch {
      return false
    }
  })

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    } catch {
      // localStorage unavailable — don't block the user
    }
    setShowOnboarding(false)
  }

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_KEY)
    } catch {
      // ignore
    }
    setShowOnboarding(true)
  }

  return { showOnboarding, completeOnboarding, resetOnboarding }
}
