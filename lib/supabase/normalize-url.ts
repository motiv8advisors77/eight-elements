/**
 * Supabase JS clients expect the project root only:
 * https://<project-ref>.supabase.co
 * A trailing /rest/v1/ (from REST docs) breaks auth and storage paths.
 */
export function normalizeSupabaseUrl(url: string | undefined): string {
  if (!url) return ''
  return url
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1\/?$/i, '')
}
