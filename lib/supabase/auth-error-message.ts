/** Map low-level fetch failures to something actionable in the UI. */
export function getAuthErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : ''

  if (
    message === 'Invalid login credentials' ||
    message === 'Invalid email or password'
  ) {
    return 'Wrong email or password. Check spelling, or reset the password in Supabase Auth if you forgot it.'
  }
  if (
    message.includes('Invalid value') ||
    message.includes('Failed to parse URL') ||
    message.includes('Invalid URL')
  ) {
    return (
      'Supabase URL is invalid for this browser. In .env.local use the Project URL from Supabase (Settings → API): ' +
      'exactly `https://<ref>.supabase.co` with no `/rest/v1` path. Save the file, delete the `.next` folder, restart `pnpm dev`, and hard-refresh the page.'
    )
  }
  if (
    message === 'Failed to fetch' ||
    message === 'Load failed' ||
    message === 'NetworkError when attempting to fetch resource.'
  ) {
    return (
      'Cannot reach Supabase. Check: (1) Project URL and anon key in .env.local, then save the file; ' +
      '(2) restart dev (stop the server, delete the .next folder, run pnpm dev); ' +
      '(3) Supabase dashboard — project is active (not paused); ' +
      '(4) try disabling VPN or ad blockers on this site.'
    )
  }
  if (message) return message
  return 'An error occurred'
}
