import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useFeatureFlags } from './useFeatureFlags'

export function useIsPermitEnabled(chainId: SupportedChainId | undefined): boolean {
  const { permitEnabledMainnet, permitEnabledGoerli, permitEnabledGnosis } = useFeatureFlags()

  switch (chainId) {
    case SupportedChainId.MAINNET:
      return !!permitEnabledMainnet
    case SupportedChainId.GNOSIS_CHAIN:
      return !!permitEnabledGnosis
    case SupportedChainId.GOERLI:
      return !!permitEnabledGoerli
    default:
      return false
  }
}
