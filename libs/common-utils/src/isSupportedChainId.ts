import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function isSupportedChainId(chainId: number | undefined): chainId is SupportedChainId {
  return typeof chainId === 'number' && chainId in SupportedChainId
}
