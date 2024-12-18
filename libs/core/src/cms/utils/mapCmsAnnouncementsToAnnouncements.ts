import { CowEnv } from '@cowprotocol/cow-sdk'

import { Announcements, CmsAnnouncements } from '../types'

export function mapCmsAnnouncementsToAnnouncements(cmsAnnouncements: CmsAnnouncements): Announcements {
  return cmsAnnouncements.reduce<Announcements>((acc, announcement) => {
    if (announcement?.attributes) {
      const { text, isCritical, networks, environments } = announcement.attributes

      // Don't ignore in case there are no chainIds nor envs
      // That just mean to apply everywhere
      const chainIds =
        networks?.data?.reduce<number[]>((ids, entry) => {
          const chainId = entry?.attributes?.chainId
          if (chainId !== undefined) ids.push(chainId)
          return ids
        }, []) || []
      const envs =
        environments?.data?.reduce<CowEnv[]>((envList, entry) => {
          const env = entry?.attributes?.name
          if (env !== undefined) envList.push(env === 'barn' ? 'staging' : 'prod')
          return envList
        }, []) || []

      acc.push({
        text,
        isCritical,
        chainIds,
        envs,
      })
    }
    return acc
  }, [])
}
