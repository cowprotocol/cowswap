import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: 'mainnet',
  [SupportedChainId.GNOSIS_CHAIN]: 'gnosis_chain',
  [SupportedChainId.GOERLI]: 'goerli',
}

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[]

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [SupportedChainId.MAINNET]

export const L1_CHAIN_IDS = [SupportedChainId.MAINNET, SupportedChainId.GOERLI, SupportedChainId.GNOSIS_CHAIN] as const

export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number]

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [] as number[]

export type SupportedL2ChainId = (typeof L2_CHAIN_IDS)[number]
