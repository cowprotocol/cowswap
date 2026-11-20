import { getBackendEnv } from './backendEnv'

const PROD_BALANCES_WATCHER_BASE_URL = 'https://balances-watcher.cow.fi'
const BARN_BALANCES_WATCHER_BASE_URL = 'https://balances-watcher.barn.cow.fi'

/** The balances watcher of `getBackendEnv`, unless `NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL` overrides it */
export function getBalancesWatcherBaseUrl(hostname: string | undefined): string {
  const configured = process.env.NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL
  if (configured) return configured

  return getBackendEnv(hostname) === 'prod' ? PROD_BALANCES_WATCHER_BASE_URL : BARN_BALANCES_WATCHER_BASE_URL
}
