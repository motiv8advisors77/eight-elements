/**
 * GoTrue expects an absolute URL for `emailRedirectTo`. Relative paths can break the client
 * and surface as `fetch()` / "Invalid value" errors in some environments.
 */
export function getAuthEmailRedirectTo(): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') || 'http://localhost:3000')

  const fromEnv = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?.trim()
  if (fromEnv) {
    if (/^https?:\/\//i.test(fromEnv)) {
      try {
        const u = new URL(fromEnv)
        if (u.protocol === 'http:' || u.protocol === 'https:') {
          return u.href.replace(/\/+$/, '')
        }
      } catch {
        // fall through to default
      }
    } else {
      const path = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`
      return `${origin}${path}`
    }
  }

  return `${origin}/auth/callback`
}
