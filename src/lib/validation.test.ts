import { describe, expect, it } from 'vitest'
import {
  signInSchema,
  signUpSchema,
  passwordResetSchema,
  sanitizeHTML,
  sanitizeInput,
  getValidationErrors,
} from './validation'

describe('signInSchema', () => {
  it('validates correct input', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('signUpSchema', () => {
  it('validates correct input', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
      displayName: 'Test User',
      age_confirmed: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects weak password', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'weak',
      displayName: 'Test User',
      age_confirmed: true,
    })
    expect(result.success).toBe(false)
    const errors = getValidationErrors(result)
    expect(errors.password).toBeDefined()
  })

  it('rejects missing age confirmation', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
      displayName: 'Test User',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    const result = signUpSchema.safeParse({
      email: 'test@example.com',
      password: 'password1',
      displayName: 'Test User',
    })
    expect(result.success).toBe(false)
  })
})

describe('passwordResetSchema', () => {
  it('validates correct email', () => {
    const result = passwordResetSchema.safeParse({ email: 'user@test.com' })
    expect(result.success).toBe(true)
  })
})

describe('sanitizeHTML', () => {
  it('escapes HTML entities', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  it('escapes ampersands', () => {
    expect(sanitizeHTML('a & b')).toBe('a &amp; b')
  })
})

describe('sanitizeInput', () => {
  it('trims and normalizes whitespace', () => {
    expect(sanitizeInput('  hello   world  ')).toBe('hello world')
  })
})
