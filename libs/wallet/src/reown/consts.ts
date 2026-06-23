import { IS_SOLANA_ENABLED, VIEM_CHAINS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, isEvmChain } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'
import { type Chain } from 'viem/chains'

import type { AppKitNetwork } from '@reown/appkit-common'

/**
 * Networks shown in the Reown / wagmi wallet connector.
 *
 * Non-EVM supported chains (Solana, once it lands in `SupportedChainId`) are dropped
 * here — wagmi only models EVM.
 */
export const SUPPORTED_REOWN_NETWORKS: AppKitNetwork[] = ALL_SUPPORTED_CHAIN_IDS.flatMap((chainId): Chain[] =>
  isEvmChain(chainId) ? [VIEM_CHAINS[chainId]] : [],
) as [Chain, ...Chain[]]

if (IS_SOLANA_ENABLED) {
  SUPPORTED_REOWN_NETWORKS.push(solana)
}

export const COW_WIDGET_CONNECTOR_ID = 'cow-widget'
export const SAFE_CONNECTOR_ID = 'safe'
