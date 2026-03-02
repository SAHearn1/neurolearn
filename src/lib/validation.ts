import { z } from 'zod'

// --- Auth schemas ---

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(100, 'Display name is too long')
  .regex(/^[a-zA-Z0-9\s\-'.]+$/, 'Display name contains invalid characters')

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
})

export const passwordResetSchema = z.object({
  email: emailSchema,
})

// --- Content schemas ---

export const courseIdSchema = z.string().uuid('Invalid course ID')
export const lessonIdSchema = z.string().uuid('Invalid lesson ID')

export const profileUpdateSchema = z.object({
  display_name: displayNameSchema.optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  learning_styles: z
    .array(z.enum(['visual', 'auditory', 'reading', 'kinesthetic']))
    .optional(),
})

export const settingsSchema = z.object({
  text_size: z.enum(['small', 'medium', 'large']).optional(),
  reduce_motion: z.boolean().optional(),
  high_contrast: z.boolean().optional(),
  screen_reader_hints: z.boolean().optional(),
})

// --- Sanitization ---

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
}

export function sanitizeHTML(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ENTITY_MAP[char] ?? char)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

// --- Helper ---

export function getValidationErrors(
  result: { success: boolean; error?: z.ZodError },
): Record<string, string> {
  if (result.success || !result.error) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}
