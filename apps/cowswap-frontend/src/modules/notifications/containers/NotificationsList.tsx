import { useWalletInfo } from '@cowprotocol/wallet'

import { cmsClient } from 'cmsClient'
import useSWR from 'swr'

interface Notification {
  id: number
  account: string
  title: string
  description: string
  url: string | null
  thumbnail: string | null
}
export function NotificationsList() {
  const { account } = useWalletInfo()

  const { data: notifications } = useSWR<Notification[]>(
    account ? `/notification-list/${account}` : null,
    (url: string | null) => {
      return url ? cmsClient.GET(url).then((res: { data: Notification[] }) => res.data) : null
    }
  )

  if (!notifications) return null

  return (
    <div>
      <h3>Notifications:</h3>
      {notifications.map((notification) => (
        <div>{notification.description}</div>
      ))}
    </div>
  )
}
