export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { logCoingeckoRequests } = await import('@/shared/api/index.server')

  logCoingeckoRequests()
}
