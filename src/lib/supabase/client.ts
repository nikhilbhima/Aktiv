// =====================================================
// SUPABASE CLIENT (Browser) - Singleton Pattern
// For use in Client Components
// =====================================================

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

let client: SupabaseClient<Database> | undefined

export function createClient() {
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return client
}
