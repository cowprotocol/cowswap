import { UNRELEASED_CHAIN_IDS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function isSupportedChainId(chainId: number | undefined): chainId is SupportedChainId {
  return typeof chainId === 'number' && chainId in SupportedChainId && !UNRELEASED_CHAIN_IDS.has(chainId)
}
