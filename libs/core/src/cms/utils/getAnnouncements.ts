import { components } from '@cowprotocol/cms'

import { querySerializer } from './querySerializer'

import { CmsAnnouncements } from '../types'
import { getCmsClient } from '../utils'

export async function getAnnouncements(): Promise<CmsAnnouncements> {
  const cmsClient = getCmsClient()

  return cmsClient
    .GET('/announcements', {
      params: {
        query: {
          populate: {
            networks: {
              fields: ['chainId'],
            },
            environments: {
              fields: ['name'],
            },
          },
          fields: ['text', 'isCritical'],
          pagination: { pageSize: 100 },
        },
      },
      querySerializer,
    })
    .then((res: { data: components['schemas']['AnnouncementListResponse'] }) => res.data?.data)
    .catch((error: Error) => {
      console.error('Failed to fetch announcements', error)
      return [] as CmsAnnouncements
    })
}
