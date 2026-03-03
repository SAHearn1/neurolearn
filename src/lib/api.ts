// src/lib/api.ts
// Typed wrapper around supabase.functions.invoke for all edge function calls.
//
// Usage:
//   import { invoke } from '../lib/api'
//   const result = await invoke<MyResponseType>('my-function', { key: 'value' })

import { supabase } from '../../utils/supabase/client'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Invoke a Supabase edge function and return the typed response body.
 *
 * @param fn      Edge function name (e.g. 'learner-progress-summary')
 * @param payload Optional JSON payload sent as the request body
 * @throws ApiError on HTTP errors or network failures
 */
export async function invoke<T = unknown>(
  fn: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(fn, {
    body: payload,
  })

  if (error) {
    // FunctionsHttpError carries a status; FunctionsRelayError / network errors do not.
    const status = (error as { status?: number }).status
    throw new ApiError(error.message ?? 'Edge function error', status)
  }

  return data as T
}
