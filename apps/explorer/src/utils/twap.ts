import { SupportedChainId } from '@cowprotocol/cow-sdk'

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
] as const

const TWAP_SUPPORTED_CHAINS = new Set<SupportedChainId>(TWAP_SUPPORTED_CHAIN_IDS)
const TWAP_EVENT_ID_PATTERN = /^\d{60,78}$/

export function isTwapEventId(value: string): boolean {
  return TWAP_EVENT_ID_PATTERN.test(value)
}

export function isTwapSupportedChain(chainId: number | null | undefined): chainId is SupportedChainId {
  return chainId !== null && chainId !== undefined && TWAP_SUPPORTED_CHAINS.has(chainId as SupportedChainId)
}
