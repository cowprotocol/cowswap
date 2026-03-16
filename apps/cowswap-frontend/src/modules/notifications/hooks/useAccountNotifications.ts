import { getAccountNotifications, NotificationModel } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

const FORCED_SPEECH_BUBBLE_NOTIFICATION: NotificationModel = {
  id: -999_999,
  account: 'debug',
  title: 'Debug speech bubble notification',
  description:
    'This message is forced in development mode. Set REACT_APP_FORCE_SPEECH_BUBBLE_NOTIFICATION=false to disable.',
  createdAt: '2099-01-01T00:00:00.000Z',
  url: '/#/swap',
  thumbnail: null,
  location: 'speechBubble',
}

const swrOptions: SWRConfiguration = {
  refreshInterval: ms`5m`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
}

export function useAccountNotifications(): NotificationModel[] | undefined {
  const { account } = useWalletInfo()

  const { data: notifications } = useSWR<NotificationModel[]>(
    account ? [account, 'account-notifications'] : null,
    ([account]) => getAccountNotifications(account),
    swrOptions,
  )

  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_FORCE_SPEECH_BUBBLE_NOTIFICATION === 'true') {
    return [...(notifications || []), FORCED_SPEECH_BUBBLE_NOTIFICATION]
  }

  return notifications
}
