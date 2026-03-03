import '@testing-library/jest-dom'
import { vi } from 'vitest'

/**
 * Supabase mock factory — provides chainable query builders
 * that mirror the real Supabase client API.
 */
function createQueryBuilder(resolvedData: unknown = null, resolvedError: unknown = null) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainMethods = [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'in',
    'is',
    'not',
    'or',
    'filter',
    'order',
    'limit',
    'range',
    'offset',
    'match',
    'textSearch',
  ]

  for (const method of chainMethods) {
    builder[method] = vi.fn().mockReturnValue(builder)
  }

  // Terminal methods return actual data
  builder.single = vi.fn().mockResolvedValue({ data: resolvedData, error: resolvedError })
  builder.maybeSingle = vi.fn().mockResolvedValue({ data: resolvedData, error: resolvedError })
  builder.then = vi
    .fn()
    .mockImplementation((resolve) =>
      resolve({ data: resolvedData ? [resolvedData] : [], error: resolvedError }),
    )

  // Make the builder itself thenable (for await without .single())
  Object.defineProperty(builder, 'then', {
    value: vi
      .fn()
      .mockImplementation((resolve) =>
        resolve({ data: resolvedData ? [resolvedData] : [], error: resolvedError, count: null }),
      ),
    writable: true,
    configurable: true,
  })

  return builder
}

vi.mock('../../utils/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue(createQueryBuilder()),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
      }),
    },
  },
}))
