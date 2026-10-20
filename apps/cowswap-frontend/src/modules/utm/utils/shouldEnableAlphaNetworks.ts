import type { UtmParams } from '@cowprotocol/common-utils'

export const ENABLE_ALPHA_NETWORKS_UTM_CONTENT = 'solana-page-hero-trade-on-solana'

export function shouldEnableAlphaNetworks(utm: UtmParams): boolean {
  return utm.utmContent === ENABLE_ALPHA_NETWORKS_UTM_CONTENT
}
