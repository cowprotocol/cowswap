import { useAtomValue } from 'jotai'

import { getTokenId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { RwaToken, rwaTokensAtom } from '../../state/tokenLists/rwaTokensAtom'

/** `assetType` values of the RWA lists that only trade while the underlying market is open */
const MARKET_HOURS_ASSET_TYPES = new Set(['stock', 'etf'])

/**
 * The first of the tokens that is an RWA traded on market hours (a tokenized stock or ETF).
 */
export function useMarketHoursRwaToken(
  firstToken: Token | undefined,
  secondToken: Token | undefined,
): Token | undefined {
  const rwaTokens = useAtomValue(rwaTokensAtom)

  if (firstToken && isMarketHoursRwa(rwaTokens.get(getTokenId(firstToken)))) return firstToken
  if (secondToken && isMarketHoursRwa(rwaTokens.get(getTokenId(secondToken)))) return secondToken

  return undefined
}

function isMarketHoursRwa(token: RwaToken | undefined): boolean {
  const assetType = token?.extensions?.['assetType']

  return typeof assetType === 'string' && MARKET_HOURS_ASSET_TYPES.has(assetType)
}
