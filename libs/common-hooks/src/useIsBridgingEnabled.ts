import { useFeatureFlags } from './useFeatureFlags'

export function useIsBridgingEnabled(isSmartContractWallet: boolean | undefined): boolean {
  const { isBridgingEnabled } = useFeatureFlags()
  // Currently, no support for bridging from smart contract wallets
  return isBridgingEnabled && !isSmartContractWallet
}
