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
