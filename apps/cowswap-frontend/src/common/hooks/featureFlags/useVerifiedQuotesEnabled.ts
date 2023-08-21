import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useFeatureFlags } from './useFeatureFlags'

export function useVerifiedQuotesEnabled(chainId: SupportedChainId): boolean {
  const { verifyQuotesMainnet, verifyQuotesGoerli, verifyQuotesGnosis } = useFeatureFlags()

  switch (chainId) {
    case SupportedChainId.MAINNET:
      return !!verifyQuotesMainnet
    case SupportedChainId.GNOSIS_CHAIN:
      return !!verifyQuotesGnosis
    case SupportedChainId.GOERLI:
      return !!verifyQuotesGoerli
    default:
      return false
  }
}
