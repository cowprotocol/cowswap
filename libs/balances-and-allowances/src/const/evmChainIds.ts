import { ALL_SUPPORTED_CHAIN_IDS, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Every EVM chain the balances-aggregator can fan a session out to (mirrors
 * balances-watcher's supported-chains list). Excludes Solana.
 */
export const EVM_CHAIN_IDS: SupportedChainId[] = ALL_SUPPORTED_CHAIN_IDS.filter(
  (chainId): chainId is SupportedChainId => isEvmChain(chainId),
)
