import { isEvmChain, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import type { ChainNamespace } from '@reown/appkit-common'

export function getReownChainNamespace(chainId: SupportedChainId): ChainNamespace | undefined {
  if (isEvmChain(chainId)) return 'eip155'
  if (isSolanaChain(chainId)) return 'solana'

  return undefined
}
