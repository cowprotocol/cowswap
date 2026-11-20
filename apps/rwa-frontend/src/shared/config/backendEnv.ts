import type { CowEnv } from '@cowprotocol/cow-sdk'

/** CoW Swap environments on the prod backend, as `isBarnBackendEnv` of `@cowprotocol/common-utils` */
const PROD_BACKEND_HOST = /^(?:staging\.)?swap\.cow\.fi$/

/**
 * The CoW backend of the environment serving the page: prod on `swap.cow.fi` and `staging.swap.cow.fi`,
 * barn (`staging`) on `dev.swap.cow.fi`, Vercel previews and localhost
 */
export function getBackendEnv(hostname: string | undefined): CowEnv {
  return hostname && PROD_BACKEND_HOST.test(hostname) ? 'prod' : 'staging'
}

/** `getBackendEnv` of the current page, barn on the server */
export function getPageBackendEnv(): CowEnv {
  return getBackendEnv(typeof window === 'undefined' ? undefined : window.location.hostname)
}
