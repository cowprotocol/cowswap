import { SupportedChainId } from '@cowprotocol/cow-sdk'

import type { RwaAsset } from './types'

/**
 * Networks the app trades on and the wallet modal offers, Ethereum first as the default. Tokens on other networks
 * are listed, but can't be traded.
 */
export const RWA_CHAIN_IDS: readonly SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.BNB,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.PLASMA,
  SupportedChainId.INK,
  SupportedChainId.GNOSIS_CHAIN,
]

const RWA_CHAIN_ID_SET = new Set<number>(RWA_CHAIN_IDS)

/** `asset` with only its tokens on `RWA_CHAIN_IDS` networks */
export function getTradeAsset(asset: RwaAsset): RwaAsset {
  return { ...asset, tokens: asset.tokens.filter((token) => isRwaTradeChain(token.chainId)) }
}

export function isRwaTradeChain(chainId: number): boolean {
  return RWA_CHAIN_ID_SET.has(chainId)
}
