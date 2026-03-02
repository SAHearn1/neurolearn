-- NeuroLearn seed data
-- Run: supabase db reset  (applies migrations + seed)

-- Sample courses
insert into public.courses (id, title, description, level, status, lesson_count) values
  ('c0000001-0000-0000-0000-000000000001', 'Focus Fundamentals', 'Build attention and focus skills with interactive exercises designed for neurodivergent learners.', 'beginner', 'published', 3),
  ('c0000001-0000-0000-0000-000000000002', 'Calm Study Systems', 'Create personalized study routines that work with your brain, not against it.', 'intermediate', 'published', 3),
  ('c0000001-0000-0000-0000-000000000003', 'Communication Lab', 'Practice communication skills through guided scenarios and real-world examples.', 'beginner', 'published', 3);

-- Sample lessons for Focus Fundamentals
insert into public.lessons (id, course_id, title, description, type, status, sort_order, duration_minutes) values
  ('l0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Intro to Routines', 'Learn why routines matter and how to build ones that stick.', 'text', 'published', 1, 10),
  ('l0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Sensory Break Planning', 'Design sensory breaks that help you recharge during study sessions.', 'interactive', 'published', 2, 15),
  ('l0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Reflection Checkpoint', 'Reflect on what you have learned and plan your next steps.', 'quiz', 'published', 3, 8);

-- Sample lessons for Calm Study Systems
insert into public.lessons (id, course_id, title, description, type, status, sort_order, duration_minutes) values
  ('l0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'Your Study Profile', 'Discover your ideal study conditions through guided self-assessment.', 'interactive', 'published', 1, 12),
  ('l0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002', 'Timer Techniques', 'Explore Pomodoro and other timer methods adapted for ADHD brains.', 'text', 'published', 2, 10),
  ('l0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000002', 'Building Your System', 'Combine techniques into a personalized study system.', 'interactive', 'published', 3, 20);

-- Sample lessons for Communication Lab
insert into public.lessons (id, course_id, title, description, type, status, sort_order, duration_minutes) values
  ('l0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000003', 'Active Listening', 'Practice active listening with guided audio exercises.', 'audio', 'published', 1, 15),
  ('l0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000003', 'Expressing Needs', 'Learn frameworks for expressing your needs clearly and confidently.', 'text', 'published', 2, 12),
  ('l0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000003', 'Conversation Simulations', 'Practice real-world conversations in a safe, guided environment.', 'interactive', 'published', 3, 20);

-- NOTE: RACA tables (cognitive_sessions, raca_audit_events, raca_artifacts,
-- epistemic_profiles, epistemic_snapshots, raca_agent_interactions) are
-- populated at runtime through user sessions. No seed data is needed
-- since they reference auth.users and are learner-scoped via RLS.
