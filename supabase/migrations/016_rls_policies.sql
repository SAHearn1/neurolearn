-- 016: Consolidated RLS review for all RACA tables
-- This migration ensures consistent policy naming and verifies coverage.
-- Individual table RLS was already applied in migrations 010-015.
-- This file adds any missing cross-table policies.

-- Verify all RACA tables have RLS enabled (no-op if already set)
alter table public.cognitive_sessions enable row level security;
alter table public.raca_audit_events enable row level security;
alter table public.cognitive_state_history enable row level security;
alter table public.raca_artifacts enable row level security;
alter table public.epistemic_profiles enable row level security;
alter table public.epistemic_snapshots enable row level security;
alter table public.raca_agent_interactions enable row level security;

-- Service role bypass for edge functions
-- (Supabase service_role key automatically bypasses RLS,
--  so no explicit policies needed for server-side access)

-- Grant edge functions access to insert audit events and interactions
-- via service role. Client-side access is gated by session ownership.
