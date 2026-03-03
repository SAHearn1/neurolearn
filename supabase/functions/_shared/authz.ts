// supabase/functions/_shared/authz.ts
// Authentication and authorization helpers for all edge functions.
//
// Usage:
//   const ctx = await authenticate(req)           // parse JWT + load role
//   requireRole(ctx, ['admin'])                    // throw 403 if not admin
//   await requireParentOf(ctx, studentId)          // throw 403 if no approved link
//   await requireEducatorOf(ctx, studentId)        // throw 403 if not student's educator
//   await requireClassOwner(ctx, classId)          // throw 403 if not class educator
//   await requireContentOwner(ctx, 'courses', id)  // throw 403 if not owner

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'learner' | 'parent' | 'educator' | 'admin'

export interface AuthContext {
  userId: string
  role: UserRole
  /** User-scoped client (respects RLS). */
  userClient: ReturnType<typeof createClient>
  /** Service-role client (bypasses RLS — use for cross-user queries only). */
  adminClient: ReturnType<typeof createClient>
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

/**
 * Extract the Bearer token from Authorization header, verify it by
 * creating a user-scoped Supabase client, then load the caller's role
 * from the profiles table.
 *
 * Throws AuthError(401) if the token is missing or invalid.
 * Throws AuthError(403) if no profile exists.
 */
export async function authenticate(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header', 401)
  }
  const token = authHeader.slice(7)

  // User-scoped client — Supabase validates the JWT automatically.
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })

  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    throw new AuthError('Invalid or expired token', 401)
  }

  // Service-role client for privileged look-ups (role fetch, cross-user data).
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    throw new AuthError('User profile not found', 403)
  }

  return {
    userId: user.id,
    role: profile.role as UserRole,
    userClient,
    adminClient,
  }
}

// ---------------------------------------------------------------------------
// Role guard
// ---------------------------------------------------------------------------

/**
 * Assert the caller's role is in the allowed list.
 * Throws AuthError(403) otherwise.
 */
export function requireRole(ctx: AuthContext, roles: UserRole[]): void {
  if (!roles.includes(ctx.role)) {
    throw new AuthError(
      `Access denied. Required role: ${roles.join(' or ')}`,
      403,
    )
  }
}

// ---------------------------------------------------------------------------
// Relationship guards
// ---------------------------------------------------------------------------

/**
 * Assert the caller is an approved parent of the given student.
 * Uses the service-role client to query parent_student_links.
 */
export async function requireParentOf(
  ctx: AuthContext,
  studentId: string,
): Promise<void> {
  const { data, error } = await ctx.adminClient
    .from('parent_student_links')
    .select('id')
    .eq('parent_id', ctx.userId)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw new AuthError('Failed to verify parent-student link', 500)
  if (!data) throw new AuthError('No approved parent link for this student', 403)
}

/**
 * Assert the caller is an educator who has the given student in one of
 * their classes (via class_enrollments → classes.educator_id).
 */
export async function requireEducatorOf(
  ctx: AuthContext,
  studentId: string,
): Promise<void> {
  requireRole(ctx, ['educator', 'admin'])

  if (ctx.role === 'admin') return // admins bypass relationship checks

  const { data, error } = await ctx.adminClient
    .from('class_enrollments')
    .select('class_id, classes!inner(educator_id)')
    .eq('student_id', studentId)
    .eq('classes.educator_id', ctx.userId)
    .limit(1)

  if (error) throw new AuthError('Failed to verify educator-student relationship', 500)
  if (!data || data.length === 0) {
    throw new AuthError('No class relationship found between educator and student', 403)
  }
}

/**
 * Assert the caller owns (created) the given class.
 */
export async function requireClassOwner(
  ctx: AuthContext,
  classId: string,
): Promise<void> {
  requireRole(ctx, ['educator', 'admin'])

  if (ctx.role === 'admin') return

  const { data, error } = await ctx.adminClient
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('educator_id', ctx.userId)
    .maybeSingle()

  if (error) throw new AuthError('Failed to verify class ownership', 500)
  if (!data) throw new AuthError('Class not found or access denied', 403)
}

/**
 * Assert the caller owns the given course or lesson (by owner_id).
 * Admins always pass.
 */
export async function requireContentOwner(
  ctx: AuthContext,
  table: 'courses' | 'lessons',
  id: string,
): Promise<void> {
  requireRole(ctx, ['educator', 'admin'])

  if (ctx.role === 'admin') return

  const { data, error } = await ctx.adminClient
    .from(table)
    .select('id')
    .eq('id', id)
    .eq('owner_id', ctx.userId)
    .maybeSingle()

  if (error) throw new AuthError(`Failed to verify ${table} ownership`, 500)
  if (!data) throw new AuthError(`${table.slice(0, -1)} not found or access denied`, 403)
}
