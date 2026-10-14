import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { ALL_SUPPORTED_CHAIN_IDS, isEvmChain, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'
import { type Chain } from 'viem/chains'

import { IS_SOLANA_WALLET_ENABLED } from '../constants'

import type { AppKitNetwork } from '@reown/appkit-common'

/**
 * Networks shown in the Reown / wagmi wallet connector.
 *
 * Non-EVM supported chains (Solana, once it lands in `SupportedChainId`) are dropped
 * here — wagmi only models EVM.
 *
 * Lives in its own module (separate from `consts.ts`) because importing `solana`
 * from `@reown/appkit/networks` pulls in Reown's ESM-only bundle. Keeping the plain
 * connector-id constants reown-free lets them be imported without dragging in that
 * bundle (which Jest does not transform).
 */
export const SUPPORTED_REOWN_NETWORKS = ALL_SUPPORTED_CHAIN_IDS.flatMap((chainId): Chain[] =>
  isEvmChain(chainId) ? [VIEM_CHAINS[chainId]] : [],
) as [AppKitNetwork, ...AppKitNetwork[]]

if (IS_SOLANA_WALLET_ENABLED) {
  SUPPORTED_REOWN_NETWORKS.push(solana)
}

export function getReownNetwork(chainId: SupportedChainId): AppKitNetwork | undefined {
  const reownNetworkId = isSolanaChain(chainId) ? solana.id : chainId

  return SUPPORTED_REOWN_NETWORKS.find(({ id }) => id === reownNetworkId)
}
