import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTgAuthorization } from './useTgAuthorization'
import { useTgSubscription } from './useTgSubscription'

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
  const authorization = useTgAuthorization()
  const { isTgSubscribed } = useTgSubscription(account, authorization)

  const result = useMemo(() => {
    // Don't show loading state if no account (user not connected)
    const isLoading = !!account && !authorization.isAuthChecked

    const channels = {
      telegram: isTgSubscribed,
    }

    const hasSubscription = channels.telegram

    return {
      hasSubscription,
      isLoading,
      channels,
    }
  }, [account, isTgSubscribed, authorization.isAuthChecked])

  return result
}
