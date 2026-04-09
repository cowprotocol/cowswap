export const DEBUG_PROGRESS_BAR_QUERY_FLAG = 'debugProgressBar'

export function isDebugProgressBarRouteEnabled(search: string, environment: string | undefined): boolean {
  if (environment === 'development') return true

  const searchParams = new URLSearchParams(search)

  return searchParams.get(DEBUG_PROGRESS_BAR_QUERY_FLAG) === '1'
}
