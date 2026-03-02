import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)

let cachedClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!hasSupabaseEnv) {
    return null
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl as string, supabaseAnonKey as string)
  }

  return cachedClient
}
