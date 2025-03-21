import { useIsSmartContractWallet } from '@cowprotocol/wallet'
import { useFeatureFlags } from './useFeatureFlags'

export function useIsBridgingEnabled(): boolean {
  const { isBridgingEnabled } = useFeatureFlags()
  // Currently, no support for bridging from smart contract wallets
  const isSmartContractWallet = useIsSmartContractWallet()

  return isBridgingEnabled && !isSmartContractWallet
}
