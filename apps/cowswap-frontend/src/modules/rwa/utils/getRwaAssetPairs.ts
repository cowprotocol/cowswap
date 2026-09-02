import { getAddressKey } from '@cowprotocol/cow-sdk'
import { ListState, RWA_TOKENS_LIST_SOURCES } from '@cowprotocol/tokens'

import type { TokenInfo as UniTokenInfo } from '@uniswap/token-lists'

const [ONDO_TOKENS_LIST_SOURCE, XSTOCKS_TOKENS_LIST_SOURCE] = RWA_TOKENS_LIST_SOURCES

export interface RwaAssetPair {
  ondo?: UniTokenInfo
  xstocks?: UniTokenInfo
}

export type RwaPlatform = 'ondo' | 'xstocks'

/**
 * Maps every RWA token address to its counterpart on the other platform, e.g. `AAPLon -> AAPLx` and `AAPLx -> AAPLon`.
 * Only assets available on both platforms are included.
 */
export function getRwaAlternativeTokensByAddress(pairs: Record<string, RwaAssetPair>): Record<string, UniTokenInfo> {
  const result: Record<string, UniTokenInfo> = {}

  Object.values(pairs).forEach(({ ondo, xstocks }) => {
    if (!ondo || !xstocks) return

    result[getRwaTokenAddressKey(ondo)] = xstocks
    result[getRwaTokenAddressKey(xstocks)] = ondo
  })

  return result
}

/**
 * Groups Ondo and xStocks tokens by their underlying asset, e.g. `{ '1:AAPL': { ondo: AAPLon, xstocks: AAPLx } }`.
 * Assets are matched by stripping each platform's symbol suffix (Ondo: `on`, xStocks: `x`), scoped per chain since
 * both lists cover multiple chains and reuse the same symbols across them.
 */
export function getRwaAssetPairs(lists: ListState[]): Record<string, RwaAssetPair> {
  const pairs: Record<string, RwaAssetPair> = {}

  lists.forEach((list) => {
    const platform = getRwaPlatform(list.source)
    if (!platform) return

    list.list.tokens.forEach((token) => {
      const baseSymbol = getRwaBaseSymbol(token.symbol, platform)
      const key = `${token.chainId}:${baseSymbol}`
      const pair = pairs[key] || (pairs[key] = {})

      pair[platform] = token
    })
  })

  return pairs
}

function getRwaBaseSymbol(symbol: string, platform: RwaPlatform): string {
  if (platform === 'ondo') return symbol.endsWith('on') ? symbol.slice(0, -2) : symbol
  return symbol.endsWith('x') ? symbol.slice(0, -1) : symbol
}

function getRwaPlatform(source: string): RwaPlatform | undefined {
  if (source === ONDO_TOKENS_LIST_SOURCE) return 'ondo'
  if (source === XSTOCKS_TOKENS_LIST_SOURCE) return 'xstocks'
  return undefined
}

function getRwaTokenAddressKey(token: UniTokenInfo): string {
  return `${token.chainId}:${getAddressKey(token.address)}`
}
