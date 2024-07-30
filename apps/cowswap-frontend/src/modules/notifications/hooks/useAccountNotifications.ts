import { getCmsClient } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { NotificationModel } from '../types'

const swrOptions: SWRConfiguration = {
  refreshInterval: ms`1m`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
}

const cmsClient = getCmsClient()

export function useAccountNotifications() {
  const { account } = useWalletInfo()

  const { data: notifications } = useSWR<NotificationModel[]>(
    account ? `/notification-list/${account}` : null,
    (url: string | null) => {
      return url
        ? cmsClient
            .GET(url)
            .then((res: { data: NotificationModel[] }) => res.data)
            .catch((error: Error) => {
              console.error('Failed to fetch notifications', error)
              return []
            })
        : null
    },
    swrOptions
  )

  return notifications
}
