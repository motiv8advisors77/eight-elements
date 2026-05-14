/**
 * Supabase JS clients must use the project **origin** only (no /rest/v1/, /auth/v1/, etc.).
 * Pasted API URLs or host-only values are normalized so browser `fetch()` always gets a valid base.
 */
export function normalizeSupabaseUrl(url: string | undefined): string {
  if (!url) return ''
  const raw = url.trim().replace(/\/+$/, '')
  if (!raw) return ''

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`

  try {
    const parsed = new URL(withScheme)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    if (!parsed.hostname) return ''
    const host = parsed.hostname.toLowerCase()
    if (host === 'undefined' || host === 'null') return ''
    // Common placeholder from docs — refuse so we fail loudly in createClient instead of bad fetch()
    if (host === 'your-project.supabase.co' || host === 'xxxx.supabase.co') return ''
    return parsed.origin
  } catch {
    return ''
  }
}
