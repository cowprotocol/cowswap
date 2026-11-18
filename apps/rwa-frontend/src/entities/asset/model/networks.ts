import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Networks the app trades on and the wallet modal offers, Ethereum first as the default. Tokens on other networks
 * are left out of the listings, see `getAssets()`.
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

/** `true` when the asset has a token on an `RWA_CHAIN_IDS` network, so it's listed and has a page */
export function isListedAsset(asset: { tokens: { chainId: number }[] }): boolean {
  return asset.tokens.some((token) => isRwaChain(token.chainId))
}

export function isRwaChain(chainId: number): boolean {
  return RWA_CHAIN_ID_SET.has(chainId)
}
