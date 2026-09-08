import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTelegramConnect } from './useTelegramConnect'

export interface UseHasNotificationSubscriptionReturn {
  hasSubscription: boolean
  isLoading: boolean
  channels: {
    telegram: boolean
  }
}

/**
 * Hook to check if the user has any active notification subscriptions.
 * Currently only checks Telegram, but structured to support additional channels in the future.
 */
export function useHasNotificationSubscription(): UseHasNotificationSubscriptionReturn {
  const { account } = useWalletInfo()
  const { isLoading, isSubscribed } = useTelegramConnect(account)

  return useMemo(() => {
    const channels = {
      telegram: isSubscribed,
    }

    return {
      hasSubscription: channels.telegram,
      isLoading,
      channels,
    }
  }, [isLoading, isSubscribed])
}
