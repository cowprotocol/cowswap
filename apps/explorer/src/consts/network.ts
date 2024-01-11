import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'

export type NetworkOptions = {
  id: SupportedChainId
  name: string
  url: string
}

export const CHAIN_ID_TO_NAME: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.GNOSIS_CHAIN]: 'Gnosis Chain',
  [SupportedChainId.GOERLI]: 'Görli',
  [SupportedChainId.SEPOLIA]: 'Sepolia',
}

export const CHAIN_ID_TO_URL_PREFIX: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '',
  [SupportedChainId.GNOSIS_CHAIN]: 'gc',
  [SupportedChainId.GOERLI]: 'goerli',
  [SupportedChainId.SEPOLIA]: 'sepolia',
}

export const NETWORK_PREFIXES = Object.values(CHAIN_ID_TO_URL_PREFIX).filter(Boolean).join('|')

export const NETWORK_OPTIONS: NetworkOptions[] = ALL_SUPPORTED_CHAIN_IDS.map((chainId) => ({
  id: chainId,
  name: CHAIN_ID_TO_NAME[chainId],
  url: CHAIN_ID_TO_URL_PREFIX[chainId],
}))
