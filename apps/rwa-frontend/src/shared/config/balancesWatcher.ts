const PROD_BALANCES_WATCHER_BASE_URL = 'https://balances-watcher.cow.fi'
const BARN_BALANCES_WATCHER_BASE_URL = 'https://balances-watcher.barn.cow.fi'

/** CoW Swap environments on the prod backend, as `isBarnBackendEnv` of `@cowprotocol/common-utils` */
const PROD_BACKEND_HOST = /^(?:staging\.)?swap\.cow\.fi$/

/**
 * The balances watcher of the environment serving the page: prod on `swap.cow.fi` and `staging.swap.cow.fi`,
 * barn on `dev.swap.cow.fi`, Vercel previews and localhost. `NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL` overrides it.
 */
export function getBalancesWatcherBaseUrl(hostname: string | undefined): string {
  const configured = process.env.NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL
  if (configured) return configured

  return hostname && PROD_BACKEND_HOST.test(hostname) ? PROD_BALANCES_WATCHER_BASE_URL : BARN_BALANCES_WATCHER_BASE_URL
}
