import { useAtomValue } from 'jotai/index'

import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useAccountNotifications } from './useAccountNotifications'

import { readNotificationsAtom } from '../state/readNotificationsAtom'

export type UnreadNotifications = Record<number, true>

const EMPTY: UnreadNotifications = {}

export function useUnreadNotifications(): UnreadNotifications {
  const { account } = useWalletInfo()
  const notifications = useAccountNotifications()
  const readNotificationsState = useAtomValue(readNotificationsAtom)

  return (
    useSWR([account, notifications, readNotificationsState], () => {
      if (!account || !notifications) return EMPTY

      const readNotifications = readNotificationsState[account]

      return notifications.reduce<UnreadNotifications>((acc, notification) => {
        const isRead = readNotifications?.includes(notification.id)

        if (!isRead) {
          acc[notification.id] = true
        }

        return acc
      }, {})
    }).data || EMPTY
  )
}
