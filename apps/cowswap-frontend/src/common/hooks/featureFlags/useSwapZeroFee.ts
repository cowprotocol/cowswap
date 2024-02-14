import { useWalletInfo } from '@cowprotocol/wallet'

import { useFeatureFlags } from './useFeatureFlags'

// Expose the feature to XX% of users
const PERCENTAGE_OF_USERS_WITH_FLAG = 30 // XX% of users

export function useSwapZeroFee(): boolean {
  const { account } = useWalletInfo()
  const { swapZeroFee } = useFeatureFlags()

  return enabledForUser(account) && swapZeroFee
}

function enabledForUser(account: string | undefined): boolean {
  if (!account) {
    return false
  }

  return parseInt(account.toLowerCase(), 0) % 100 < PERCENTAGE_OF_USERS_WITH_FLAG
}
