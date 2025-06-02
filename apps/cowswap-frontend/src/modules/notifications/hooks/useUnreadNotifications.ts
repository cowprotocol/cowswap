import { useAtomValue } from 'jotai'

import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useAccountNotifications } from './useAccountNotifications'

import { readNotificationsAtom } from '../state/readNotificationsAtom'

export type UnreadNotifications = Record<number, true>

const EMPTY: UnreadNotifications = {}

export function useUnreadNotifications(): UnreadNotifications {
  const { account } = useWalletInfo()
  const notifications = useAccountNotifications()
  const readNotifications = useAtomValue(readNotificationsAtom)

  return (
    useSWR(
      account && notifications ? [account, notifications, readNotifications] : null,
      ([, _notifications, _readNotifications]) => {
        return _notifications.reduce<UnreadNotifications>((acc, notification) => {
          const isRead = _readNotifications.includes(notification.id)

          if (!isRead) {
            acc[notification.id] = true
          }

          return acc
        }, {})
      },
    ).data || EMPTY
  )
}
