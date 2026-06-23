import { IS_SOLANA_ENABLED, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { EvmChains, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'

import type { AppKitNetwork } from '@reown/appkit-common'

const urlChainId = getCurrentChainIdFromUrl()

export function getReownDefaultNetwork(): AppKitNetwork {
  const isSolanaNetwork = urlChainId === SupportedChainId.SOLANA

  if (IS_SOLANA_ENABLED && isSolanaNetwork) {
    return solana
  }

  if (isEvmChain(urlChainId)) return VIEM_CHAINS[urlChainId]

  return VIEM_CHAINS[EvmChains.MAINNET]
}
