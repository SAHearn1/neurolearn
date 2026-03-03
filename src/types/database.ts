/**
 * Supabase Database Types — manually defined until `supabase gen types` is run.
 *
 * These types mirror the Supabase schema defined in migrations 001-016.
 * Run `npx supabase gen types typescript --local > src/types/database.ts`
 * to auto-generate from the live schema.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          avatar_url: string | null
          learning_styles: string[]
          accessibility: Record<string, unknown>
          streak_days: number
          lessons_completed: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['profiles']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          level: 'beginner' | 'intermediate' | 'advanced'
          status: 'draft' | 'published' | 'archived'
          thumbnail_url: string | null
          lesson_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['courses']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string
          type: 'text' | 'video' | 'audio' | 'interactive' | 'quiz'
          status: 'draft' | 'published' | 'archived'
          content: string | null
          sort_order: number
          duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['lessons']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          score: number | null
          time_spent_seconds: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['lesson_progress']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['lesson_progress']['Insert']>
      }
      cognitive_sessions: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          status: 'active' | 'paused' | 'completed' | 'abandoned'
          current_state: string
          state_history: string[]
          regulation: Record<string, unknown>
          started_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['cognitive_sessions']['Row'],
          'started_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['cognitive_sessions']['Insert']>
      }
      raca_audit_events: {
        Row: {
          id: string
          session_id: string
          kind: string
          source: string
          state_before: string | null
          state_after: string | null
          payload: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['raca_audit_events']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['raca_audit_events']['Insert']>
      }
      raca_artifacts: {
        Row: {
          id: string
          session_id: string
          kind: string
          state: string
          content: string
          word_count: number
          version: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['raca_artifacts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['raca_artifacts']['Insert']>
      }
      epistemic_profiles: {
        Row: {
          user_id: string
          session_count: number
          revision_frequency: number
          reflection_depth_avg: number
          defense_strength_avg: number
          framing_sophistication: number
          trace_averages: Record<string, number>
          growth_trajectory: 'emerging' | 'developing' | 'proficient'
          updated_at: string
        }
        Insert: Database['public']['Tables']['epistemic_profiles']['Row']
        Update: Partial<Database['public']['Tables']['epistemic_profiles']['Insert']>
      }
      raca_agent_interactions: {
        Row: {
          id: string
          session_id: string
          agent_id: string
          state: string
          prompt: string
          response: string | null
          blocked: boolean
          block_reason: string | null
          constraint_violations: string[]
          response_time_ms: number | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['raca_agent_interactions']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['raca_agent_interactions']['Insert']>
      }
    }
  }
}
