/** PKCE / email flows: never pass an empty string (env `KEY=` is still defined). */
export function getAuthEmailRedirectTo(): string {
  const fromEnv = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?.trim()
  if (fromEnv) return fromEnv
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`
  }
  return "/auth/callback"
}
