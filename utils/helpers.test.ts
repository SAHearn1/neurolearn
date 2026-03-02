import { describe, expect, it } from 'vitest'
import { toTitleCase } from './helpers'

describe('toTitleCase', () => {
  it('converts words to title case and normalizes spacing', () => {
    expect(toTitleCase('  nEuRoLEarn   platform ')).toBe('Neurolearn Platform')
  })
})
