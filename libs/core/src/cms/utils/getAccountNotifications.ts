import { TTLCache } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { NotificationModel } from '../types'
import { getCmsClient } from '../utils'

const NOTIFICATIONS_TTL = ms`5m`

const cache = new TTLCache<NotificationModel[]>('cms-account-notifications', true, NOTIFICATIONS_TTL)

export async function getAccountNotifications(account: string): Promise<NotificationModel[]> {
  const cacheKey = account.toLowerCase()
  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const result = await fetchAccountNotifications(account)
  cache.set(cacheKey, result)
  return result
}

async function fetchAccountNotifications(account: string): Promise<NotificationModel[]> {
  const cmsClient = getCmsClient()

  return cmsClient
    .GET(`/notification-list/${account}`)
    .then((res: { data: NotificationModel[] }) => res.data || [])
    .catch((error: Error) => {
      console.error('Failed to fetch notifications', error)
      return []
    })
}
