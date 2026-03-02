import { countQuestions } from '../layer3-agents/agent-base'

/**
 * Question Enforcer — ensures AI agents ask questions before giving information.
 * Core RootWork principle: the learner must think before the AI explains.
 */

export interface QuestionEnforcementResult {
  passed: boolean
  questionCount: number
  requiredCount: number
  violation: string | null
}

export function enforceQuestionsFirst(
  response: string,
  minQuestions: number = 1,
): QuestionEnforcementResult {
  const questionCount = countQuestions(response)

  if (questionCount < minQuestions) {
    return {
      passed: false,
      questionCount,
      requiredCount: minQuestions,
      violation: `Response has ${questionCount} question(s), minimum is ${minQuestions}`,
    }
  }

  // Check that the first question appears in the first half of the response
  const midpoint = Math.floor(response.length / 2)
  const firstQuestionIdx = response.indexOf('?')
  if (firstQuestionIdx > midpoint && response.length > 200) {
    return {
      passed: false,
      questionCount,
      requiredCount: minQuestions,
      violation: 'First question should appear in the first half of the response',
    }
  }

  return {
    passed: true,
    questionCount,
    requiredCount: minQuestions,
    violation: null,
  }
}

/**
 * Check that the AI asks the learner to reason BEFORE confirming or explaining.
 * Pattern: question → learner thinks → AI responds to learner's reasoning.
 */
export function enforceReasoningBeforeConfirmation(
  response: string,
): { passed: boolean; violation: string | null } {
  // If response starts with confirmation/explanation without a question
  const startsWithExplanation = /^(?:Yes|No|Correct|Right|Exactly|That's right)/i.test(
    response.trim(),
  )
  const hasLeadingQuestion = response.indexOf('?') < 100 && response.indexOf('?') !== -1

  if (startsWithExplanation && !hasLeadingQuestion) {
    return {
      passed: false,
      violation: 'AI should ask for reasoning before confirming or explaining',
    }
  }

  return { passed: true, violation: null }
}
