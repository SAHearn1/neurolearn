// supabase/functions/educator-class-roster/index.ts
// Returns the list of students enrolled in one of the educator's classes.
//
// Method: POST
// Body: { class_id: string }
// Response: { class_id, class_name, students: StudentRow[] }

import { authenticate, requireClassOwner } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

interface StudentRow {
  student_id: string
  display_name: string
  enrolled_at: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const classId = requireUuid(body, 'class_id')

    await requireClassOwner(ctx, classId)

    // Fetch class metadata.
    const { data: cls, error: clsError } = await ctx.adminClient
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .single()

    if (clsError) throw new Error(clsError.message)

    // Fetch enrolled students with their profiles.
    const { data: enrollments, error: enrollError } = await ctx.adminClient
      .from('class_enrollments')
      .select('student_id, enrolled_at')
      .eq('class_id', classId)
      .order('enrolled_at', { ascending: true })

    if (enrollError) throw new Error(enrollError.message)

    if (!enrollments || enrollments.length === 0) {
      return json({ class_id: classId, class_name: cls.name, students: [] })
    }

    const studentIds = enrollments.map((e) => e.student_id)
    const { data: profiles, error: profileError } = await ctx.adminClient
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', studentIds)

    if (profileError) throw new Error(profileError.message)

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) ?? [])

    const students: StudentRow[] = enrollments.map((e) => ({
      student_id: e.student_id,
      display_name: profileMap.get(e.student_id) ?? 'Unknown',
      enrolled_at: e.enrolled_at,
    }))

    return json({ class_id: classId, class_name: cls.name, students })
  } catch (err) {
    return handleError(err)
  }
})
