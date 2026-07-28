import { IS_SOLANA_ENABLED, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { EvmChains, isEvmChain, isSolanaChain } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'

import type { AppKitNetwork } from '@reown/appkit-common'

export function getReownDefaultNetwork(): AppKitNetwork {
  const urlChainId = getCurrentChainIdFromUrl()

  if (IS_SOLANA_ENABLED && isSolanaChain(urlChainId)) {
    return solana
  }

  if (isEvmChain(urlChainId)) return VIEM_CHAINS[urlChainId]

  return VIEM_CHAINS[EvmChains.MAINNET]
}
