import { isSolanaChain } from '@cowprotocol/cow-sdk'

export function isTwapSupportedChain(chainId: number | undefined): boolean {
  return !!chainId && !isSolanaChain(chainId)
}
