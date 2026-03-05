/**
 * Regulation Intervention Content Library — REQ-18-06 (spec §IX).
 *
 * Typed content for co-regulation micro-activities, organized by
 * regulation level band and activity type. Used by RegulationIntervention
 * to surface contextually appropriate support.
 *
 * Content categories:
 *   breathing  — breath-work techniques
 *   grounding  — sensory grounding exercises
 *   movement   — physical micro-breaks
 *   cognitive  — reframing and self-compassion prompts
 */

export type ActivityType = 'breathing' | 'grounding' | 'movement' | 'cognitive'

export interface RegulationActivity {
  type: ActivityType
  title: string
  instruction: string
  durationSeconds: number
}

/** Regulation level bands */
export const REGULATION_BANDS = {
  CRITICAL: { min: 0, max: 29 }, // ≤30: dysregulated — requires immediate intervention
  LOW: { min: 30, max: 49 }, // 30-49: struggling — needs support
  MODERATE: { min: 50, max: 100 }, // 50+: manageable — brief check-in
} as const

/**
 * Activity pool for critical dysregulation (≤30).
 * Extended, slower activities to lower arousal.
 */
export const CRITICAL_ACTIVITIES: RegulationActivity[] = [
  {
    type: 'breathing',
    title: 'Box Breathing',
    instruction:
      'Inhale slowly for 4 counts → hold for 4 counts → exhale for 4 counts → hold for 4 counts. Repeat 4 times.',
    durationSeconds: 90,
  },
  {
    type: 'breathing',
    title: '4-7-8 Breath',
    instruction:
      'Inhale through your nose for 4 counts → hold for 7 counts → exhale completely through your mouth for 8 counts. Repeat 3 times.',
    durationSeconds: 90,
  },
  {
    type: 'grounding',
    title: '5-4-3-2-1 Grounding',
    instruction:
      'Name 5 things you can see → 4 you can physically touch → 3 you can hear right now → 2 you can smell → 1 you can taste.',
    durationSeconds: 120,
  },
  {
    type: 'movement',
    title: 'Step Away',
    instruction:
      'Stand up and walk to a different room or outside for 2-3 minutes. Your work is saved and waiting for you.',
    durationSeconds: 180,
  },
  {
    type: 'cognitive',
    title: 'Self-Compassion Pause',
    instruction:
      'Place a hand on your heart. Say to yourself: "This is hard. Hard things are supposed to feel hard. I can take a break and come back."',
    durationSeconds: 60,
  },
]

/**
 * Activity pool for low regulation (30-49).
 * Moderate activities to restore focus.
 */
export const LOW_ACTIVITIES: RegulationActivity[] = [
  {
    type: 'breathing',
    title: 'Slow Exhale Breath',
    instruction: 'Take 3 deep breaths, making each exhale twice as long as the inhale.',
    durationSeconds: 45,
  },
  {
    type: 'movement',
    title: 'Shoulder Roll',
    instruction:
      'Roll your shoulders backward 5 times, then forward 5 times. Drop your jaw and relax your face.',
    durationSeconds: 30,
  },
  {
    type: 'movement',
    title: 'Hydration Break',
    instruction: 'Get a glass of water. Drink it slowly and notice the temperature and taste.',
    durationSeconds: 60,
  },
  {
    type: 'grounding',
    title: '3-3-3 Grounding',
    instruction:
      'Name 3 things you can see → 3 you can hear → press 3 fingers against a surface and feel the texture.',
    durationSeconds: 45,
  },
  {
    type: 'cognitive',
    title: 'Normalize the Struggle',
    instruction:
      '"I am confused right now. That means I am at the edge of my understanding — exactly where growth happens."',
    durationSeconds: 30,
  },
]

/**
 * Activity pool for moderate regulation (50+).
 * Quick check-in before continuing.
 */
export const MODERATE_ACTIVITIES: RegulationActivity[] = [
  {
    type: 'breathing',
    title: 'Reset Breath',
    instruction: 'Take one long, slow breath in through your nose and out through your mouth.',
    durationSeconds: 15,
  },
  {
    type: 'movement',
    title: 'Neck Stretch',
    instruction:
      'Tilt your right ear toward your right shoulder for 10 seconds, then switch sides.',
    durationSeconds: 25,
  },
  {
    type: 'grounding',
    title: '20-20-20 Eye Rest',
    instruction: 'Look at something 20 feet away for 20 seconds to reduce eye strain.',
    durationSeconds: 20,
  },
  {
    type: 'cognitive',
    title: 'Intention Reset',
    instruction: 'In one sentence, remind yourself why this topic matters to you personally.',
    durationSeconds: 20,
  },
]

/**
 * Returns a random activity appropriate for the given regulation level,
 * optionally excluding recently shown activities.
 */
export function getActivityForLevel(level: number, excludeTitle?: string): RegulationActivity {
  const pool =
    level < REGULATION_BANDS.CRITICAL.max + 1
      ? CRITICAL_ACTIVITIES
      : level < REGULATION_BANDS.LOW.max + 1
        ? LOW_ACTIVITIES
        : MODERATE_ACTIVITIES

  const available = excludeTitle ? pool.filter((a) => a.title !== excludeTitle) : pool
  const candidates = available.length > 0 ? available : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}
