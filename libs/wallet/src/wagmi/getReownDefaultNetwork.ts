import { VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { EvmChains, isEvmChain, isSolanaChain } from '@cowprotocol/cow-sdk'

import { IS_SOLANA_WALLET_ENABLED } from '../constants'
import { SOLANA_NETWORK } from '../reown/solanaNetwork'

import type { AppKitNetwork } from '@reown/appkit-common'

export function getReownDefaultNetwork(): AppKitNetwork {
  const urlChainId = getCurrentChainIdFromUrl()

  if (IS_SOLANA_WALLET_ENABLED && isSolanaChain(urlChainId)) {
    return SOLANA_NETWORK
  }

  if (isEvmChain(urlChainId)) return VIEM_CHAINS[urlChainId]

  return VIEM_CHAINS[EvmChains.MAINNET]
}
