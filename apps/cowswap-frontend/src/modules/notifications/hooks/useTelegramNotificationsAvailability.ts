import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

export interface TelegramNotificationsAvailability {
  isAvailable: boolean
  isUnsupportedChain: boolean
}

export function useTelegramNotificationsAvailability(): TelegramNotificationsAvailability {
  const { chainId } = useWalletInfo()
  const { areTelegramNotificationsEnabled } = useFeatureFlags()

  const isFeatureEnabled = Boolean(areTelegramNotificationsEnabled)
  const isSolana = isSolanaChain(chainId)

  return {
    isAvailable: isFeatureEnabled && !isSolana,
    isUnsupportedChain: isFeatureEnabled && isSolana,
  }
}
