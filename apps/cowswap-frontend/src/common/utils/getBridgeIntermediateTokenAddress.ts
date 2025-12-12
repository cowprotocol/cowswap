import { BridgeQuoteResults } from '@cowprotocol/sdk-bridging'
import { Nullish } from '@cowprotocol/types'

export function getBridgeIntermediateTokenAddress(quote: Nullish<BridgeQuoteResults>): string | null {
  return quote?.tradeParameters?.sellTokenAddress ?? null
}
