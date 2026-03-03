// supabase/functions/_shared/validate.ts
// Lightweight request-body validation helpers (no external deps).

export class ValidationError extends Error {
  readonly status = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/** Parse JSON body; throws ValidationError on malformed JSON. */
export async function parseBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new ValidationError('Request body must be a JSON object')
    }
    return body as Record<string, unknown>
  } catch (err) {
    if (err instanceof ValidationError) throw err
    throw new ValidationError('Invalid JSON body')
  }
}

export function requireString(obj: Record<string, unknown>, field: string): string {
  const val = obj[field]
  if (typeof val !== 'string' || val.trim() === '') {
    throw new ValidationError(`Field '${field}' is required and must be a non-empty string`)
  }
  return val.trim()
}

export function optionalString(
  obj: Record<string, unknown>,
  field: string,
): string | undefined {
  const val = obj[field]
  if (val === undefined || val === null) return undefined
  if (typeof val !== 'string') throw new ValidationError(`Field '${field}' must be a string`)
  return val.trim() || undefined
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function requireUuid(obj: Record<string, unknown>, field: string): string {
  const val = requireString(obj, field)
  if (!UUID_RE.test(val)) throw new ValidationError(`Field '${field}' must be a valid UUID`)
  return val
}

export function optionalUuid(
  obj: Record<string, unknown>,
  field: string,
): string | undefined {
  const val = optionalString(obj, field)
  if (val === undefined) return undefined
  if (!UUID_RE.test(val)) throw new ValidationError(`Field '${field}' must be a valid UUID`)
  return val
}

export function requireBoolean(obj: Record<string, unknown>, field: string): boolean {
  const val = obj[field]
  if (typeof val !== 'boolean') throw new ValidationError(`Field '${field}' must be a boolean`)
  return val
}

export function optionalNumber(
  obj: Record<string, unknown>,
  field: string,
  defaultValue: number,
): number {
  const val = obj[field]
  if (val === undefined || val === null) return defaultValue
  if (typeof val !== 'number' || !Number.isFinite(val)) {
    throw new ValidationError(`Field '${field}' must be a finite number`)
  }
  return val
}
