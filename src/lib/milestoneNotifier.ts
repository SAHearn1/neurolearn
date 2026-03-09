import { supabase } from '../../utils/supabase/client'

export async function notifyParents(
  studentId: string,
  milestoneType: string,
  context?: { lessonTitle?: string; courseTitle?: string },
): Promise<void> {
  try {
    // Find confirmed parent links
    const { data: links } = await supabase
      .from('parent_student_links')
      .select('parent_id')
      .eq('student_id', studentId)
      .eq('status', 'confirmed')

    if (!links || links.length === 0) return

    const notifications = links.map((link) => ({
      student_id: studentId,
      parent_id: link.parent_id as string,
      milestone_type: milestoneType,
      lesson_title: context?.lessonTitle ?? null,
      course_title: context?.courseTitle ?? null,
    }))

    await supabase.from('milestone_notifications').insert(notifications)
  } catch {
    // Fire-and-forget — never block lesson completion
  }
}
