import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useFeatureFlags } from './useFeatureFlags'

export function useIsPermitEnabled(chainId: SupportedChainId | undefined): boolean {
  const isSmartContractWallet = useIsSmartContractWallet()
  const { permitEnabledMainnet, permitEnabledGoerli, permitEnabledGnosis } = useFeatureFlags()

  // Permit is only available for EOAs
  if (isSmartContractWallet) {
    return false
  }

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
