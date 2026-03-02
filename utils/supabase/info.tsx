/**
 * Supabase Project Info
 *
 * This file documents the Supabase project configuration.
 * Actual credentials are stored in .env.local (never committed).
 *
 * Usage:
 *   import { supabase } from './client'
 *
 * Environment variables required:
 *   VITE_SUPABASE_URL     — Your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — Your Supabase anon (public) key
 *
 * To obtain these values:
 *   1. Go to https://supabase.com and open your project
 *   2. Navigate to Project Settings → API
 *   3. Copy the Project URL and anon key into .env.local
 */

export const supabaseInfo = {
  projectUrl: import.meta.env.VITE_SUPABASE_URL as string,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
}
