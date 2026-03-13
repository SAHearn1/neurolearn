/**
 * RACA Cognitive States — the 9-state learning progression
 *
 * ROOT → REGULATE → POSITION → PLAN → APPLY → REVISE → DEFEND → RECONNECT → ARCHIVE
 *
 * Modeled after RootWork 5Rs (Regulate, Relate, Reason, Repair, Restore)
 * extended into a full cognitive architecture with explicit epistemic phases.
 */

export const COGNITIVE_STATES = [
  'ROOT',
  'REGULATE',
  'POSITION',
  'PLAN',
  'APPLY',
  'REVISE',
  'DEFEND',
  'RECONNECT',
  'ARCHIVE',
] as const

export type CognitiveState = (typeof COGNITIVE_STATES)[number]

export interface StateMetadata {
  label: string
  description: string
  fiveRMapping: string
  allowsAgent: boolean
}

export const STATE_METADATA: Record<CognitiveState, StateMetadata> = {
  ROOT: {
    label: 'Root',
    description: 'Grounding and orientation — learner connects to prior knowledge and context.',
    fiveRMapping: 'Relate',
    allowsAgent: false,
  },
  REGULATE: {
    label: 'Regulate',
    description: 'Emotional and cognitive regulation check — ensures readiness to learn.',
    fiveRMapping: 'Regulate',
    allowsAgent: false,
  },
  POSITION: {
    label: 'Position',
    description: 'Frame the question or problem — identify what is being asked.',
    fiveRMapping: 'Reason',
    allowsAgent: true,
  },
  PLAN: {
    label: 'Plan',
    description: 'Research and plan an approach — gather information and outline strategy.',
    fiveRMapping: 'Reason',
    allowsAgent: true,
  },
  APPLY: {
    label: 'Apply',
    description: 'Construct a draft response or solution — do the work.',
    fiveRMapping: 'Reason',
    allowsAgent: true,
  },
  REVISE: {
    label: 'Revise',
    description: 'Critique and revise the draft — identify gaps and strengthen reasoning.',
    fiveRMapping: 'Repair',
    allowsAgent: true,
  },
  DEFEND: {
    label: 'Defend',
    description: 'Defend the revised work — demonstrate understanding under questioning.',
    fiveRMapping: 'Repair',
    allowsAgent: true,
  },
  RECONNECT: {
    label: 'Reconnect',
    description: 'Reflect and reconnect — integrate new learning with existing knowledge.',
    fiveRMapping: 'Restore',
    allowsAgent: true,
  },
  ARCHIVE: {
    label: 'Archive',
    description: 'Session complete — finalize artifacts and record cognitive growth.',
    fiveRMapping: 'Restore',
    allowsAgent: false,
  },
}

export interface CognitiveTransition {
  from: CognitiveState
  to: CognitiveState
  trigger: string
  conditions: string[]
}

export interface StudentStateLabel {
  label: string
  description: string
}

export const STUDENT_STATE_LABELS: Record<string, StudentStateLabel> = {
  ROOT: { label: 'Take a breath', description: 'Get centered before we begin.' },
  REGULATE: {
    label: 'Check in with yourself',
    description: 'Notice how you are feeling right now.',
  },
  POSITION: {
    label: 'What do you want to know?',
    description: 'State the question in your own words.',
  },
  PLAN: { label: 'Make a plan', description: 'How will you approach this?' },
  APPLY: {
    label: 'Write your first attempt',
    description: 'Get your thinking on paper — it does not need to be perfect.',
  },
  REVISE: {
    label: 'Improve your thinking',
    description: 'Look back and make it stronger.',
  },
  DEFEND: { label: 'Explain your why', description: 'Can you justify your reasoning?' },
  RECONNECT: {
    label: 'Look back and grow',
    description: 'What did you learn about how you think?',
  },
  ARCHIVE: {
    label: 'Save your insights',
    description: 'Your thinking is preserved for next time.',
  },
}

export const VALID_TRANSITIONS: CognitiveTransition[] = [
  { from: 'ROOT', to: 'REGULATE', trigger: 'learner_ready', conditions: ['Session initialized'] },
  {
    from: 'REGULATE',
    to: 'POSITION',
    trigger: 'regulation_passed',
    conditions: ['Regulation level >= 60'],
  },
  {
    from: 'POSITION',
    to: 'PLAN',
    trigger: 'position_framed',
    conditions: ['Reflection submitted'],
  },
  { from: 'PLAN', to: 'APPLY', trigger: 'plan_ready', conditions: ['Plan outline exists'] },
  { from: 'APPLY', to: 'REVISE', trigger: 'draft_submitted', conditions: ['Draft artifact saved'] },
  {
    from: 'REVISE',
    to: 'DEFEND',
    trigger: 'revision_complete',
    conditions: ['Revision artifact saved'],
  },
  {
    from: 'DEFEND',
    to: 'RECONNECT',
    trigger: 'defense_complete',
    conditions: ['Learner explanation submitted'],
  },
  {
    from: 'RECONNECT',
    to: 'ARCHIVE',
    trigger: 'reconnection_complete',
    conditions: ['Reflection submitted'],
  },
  // Backward transitions (re-regulation)
  {
    from: 'POSITION',
    to: 'REGULATE',
    trigger: 'dysregulation_detected',
    conditions: ['Regulation level < 40'],
  },
  {
    from: 'PLAN',
    to: 'REGULATE',
    trigger: 'dysregulation_detected',
    conditions: ['Regulation level < 40'],
  },
  {
    from: 'APPLY',
    to: 'REGULATE',
    trigger: 'dysregulation_detected',
    conditions: ['Regulation level < 40'],
  },
  {
    from: 'REVISE',
    to: 'REGULATE',
    trigger: 'dysregulation_detected',
    conditions: ['Regulation level < 40'],
  },
  {
    from: 'DEFEND',
    to: 'REGULATE',
    trigger: 'dysregulation_detected',
    conditions: ['Regulation level < 40'],
  },
  {
    from: 'RECONNECT',
    to: 'REGULATE',
    trigger: 'dysregulation_detected',
    conditions: ['Regulation level < 40'],
  },
]
