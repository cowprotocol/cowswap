import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, EvmChains, isEvmChain } from '@cowprotocol/cow-sdk'

import { type Chain } from 'viem/chains'

/**
 * Networks shown in the Reown / wagmi wallet connector.
 *
 * `ALL_SUPPORTED_CHAIN_IDS` is filtered through `isEvmChain` so non-EVM supported chains
 * (Solana) don't leak into wagmi — wagmi only models EVM. `OPTIMISM` lives in `EvmChains`
 * but not in `SupportedChainId`, so it doesn't appear here either.
 */
export const SUPPORTED_REOWN_NETWORKS = ALL_SUPPORTED_CHAIN_IDS.filter(isEvmChain).map(
  // `isEvmChain` returns `chainId is EvmChains`, but `Array.filter`'s predicate-narrow
  // overload only triggers when the predicate's target extends the array element type.
  // `EvmChains` doesn't extend `SupportedChainId` (different nominal enums), so the
  // narrow doesn't propagate to `chainId` here — cast through `unknown` to satisfy TS.
  (chainId) => VIEM_CHAINS[chainId as unknown as EvmChains],
) as [Chain, ...Chain[]]

export const COW_WIDGET_CONNECTOR_ID = 'cow-widget'
