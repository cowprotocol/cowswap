import { createCowLogger } from '@cowprotocol/common-utils'

const logger = createCowLogger('Affiliate')

export function logAffiliate(...args: unknown[]): void {
  logger.debug(...args)
}
