import { SupportedChainId } from '@cowprotocol/cow-sdk'

export { isTwapEventId } from '@cowprotocol/common-utils'

export const TWAP_SUPPORTED_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.BASE,
  SupportedChainId.BNB,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.LINEA,
  SupportedChainId.INK,
  SupportedChainId.PLASMA,
  SupportedChainId.SEPOLIA,
] as const

const TWAP_SUPPORTED_CHAINS = new Set<SupportedChainId>(TWAP_SUPPORTED_CHAIN_IDS)

export function isTwapSupportedChain(chainId: number | null | undefined): chainId is SupportedChainId {
  return chainId !== null && chainId !== undefined && TWAP_SUPPORTED_CHAINS.has(chainId as SupportedChainId)
}
