import { createBrowserClient } from '@supabase/ssr'
import { normalizeSupabaseUrl } from '@/lib/supabase/normalize-url'

export function createClient() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Supabase URL or anon key is missing in the browser. Save .env.local, then stop the dev server, delete the .next folder, and run pnpm dev again.',
    )
  }
  return createBrowserClient(url, anonKey)
}
