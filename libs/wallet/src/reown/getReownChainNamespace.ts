import { ALL_SUPPORTED_CHAINS_MAP, SupportedChainId } from '@cowprotocol/cow-sdk'

import type { ChainNamespace } from '@reown/appkit-common'

export function getReownChainNamespace(chainId: SupportedChainId): ChainNamespace | undefined {
  return ALL_SUPPORTED_CHAINS_MAP[chainId].caip2Namespace
}
