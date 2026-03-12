-- Migration 059: Educator RLS — read access to student profiles, sessions, and TRACE data
--
-- Problem: educator-facing pages (StudentProgressTable, EducatorStudentDetailPage)
-- query profiles, cognitive_sessions, and epistemic_profiles for their enrolled students.
-- All three tables only allow auth.uid() = user_id, so educators receive empty results
-- despite the educator–student relationship being established via class_enrollments or
-- educator_student_links. This causes:
--   • StudentProgressTable: "No students enrolled" even when class_enrollments has rows
--   • EducatorStudentDetailPage: student name shows "Student" (display_name null fallback)
--   • EducatorStudentDetailPage 5Rs Timeline: cognitive_sessions returns 400
--   • EducatorStudentDetailPage TRACE Profile: epistemic_profiles returns empty
--
-- Fix: add educator SELECT policies on profiles, cognitive_sessions, and epistemic_profiles.
-- An educator is authorised to read a student's row if any of the following is true:
--   (a) A direct educator_student_links row exists (educator_id = auth.uid(), student_id = row.user_id)
--   (b) The student is enrolled in a class owned by the educator via class_enrollments + classes
--
-- These policies are additive — existing user self-read policies remain unchanged.

-- ── profiles ──────────────────────────────────────────────────────────────────

CREATE POLICY "Educators can read enrolled student profiles"
  ON public.profiles FOR SELECT
  USING (
    -- direct link
    EXISTS (
      SELECT 1 FROM public.educator_student_links esl
      WHERE esl.educator_id = auth.uid()
        AND esl.student_id = profiles.user_id
    )
    OR
    -- class enrollment
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON c.id = ce.class_id
      WHERE c.educator_id = auth.uid()
        AND ce.student_id = profiles.user_id
    )
  );

-- ── cognitive_sessions ────────────────────────────────────────────────────────

CREATE POLICY "Educators can read enrolled student sessions"
  ON public.cognitive_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.educator_student_links esl
      WHERE esl.educator_id = auth.uid()
        AND esl.student_id = cognitive_sessions.user_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON c.id = ce.class_id
      WHERE c.educator_id = auth.uid()
        AND ce.student_id = cognitive_sessions.user_id
    )
  );

-- ── epistemic_profiles ────────────────────────────────────────────────────────

CREATE POLICY "Educators can read enrolled student epistemic profiles"
  ON public.epistemic_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.educator_student_links esl
      WHERE esl.educator_id = auth.uid()
        AND esl.student_id = epistemic_profiles.user_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.classes c ON c.id = ce.class_id
      WHERE c.educator_id = auth.uid()
        AND ce.student_id = epistemic_profiles.user_id
    )
  );
