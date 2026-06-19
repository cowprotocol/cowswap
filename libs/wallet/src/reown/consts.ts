import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, isEvmChain } from '@cowprotocol/cow-sdk'

import { type Chain } from 'viem/chains'

/**
 * Networks shown in the Reown / wagmi wallet connector.
 *
 * Non-EVM supported chains (Solana, once it lands in `SupportedChainId`) are dropped
 * here — wagmi only models EVM.
 */
export const SUPPORTED_REOWN_NETWORKS = ALL_SUPPORTED_CHAIN_IDS.flatMap((chainId): Chain[] =>
  isEvmChain(chainId) ? [VIEM_CHAINS[chainId]] : [],
) as [Chain, ...Chain[]]

export const COW_WIDGET_CONNECTOR_ID = 'cow-widget'
export const SAFE_CONNECTOR_ID = 'safe'

/** Secondary Reown registry entry for Coinbase Wallet — same wallet as the canonical Base id. */
export const COINBASE_LEGACY_WALLET_ID = 'd0ca99ff52b99abc48743dad0f7fc891e041be73574f7fac4afe5d4bb83845c8'
