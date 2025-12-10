import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const AFFILIATE_SUPPORTED_CHAIN_IDS: readonly SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.LENS,
  SupportedChainId.SEPOLIA,
] as const
