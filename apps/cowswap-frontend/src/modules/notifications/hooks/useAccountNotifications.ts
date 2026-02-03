import { getAccountNotifications, NotificationModel } from '@cowprotocol/core'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

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

  return notifications
}
