import { log } from '@cowprotocol/common-utils'

export function logAffiliate(...args: unknown[]): void {
  log('Affiliate', undefined, ...args)
}
