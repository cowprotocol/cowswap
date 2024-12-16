import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isProdLike } from '@cowprotocol/common-utils'
import { Announcements, announcementsAtom } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

function useAnnouncements(chainId: SupportedChainId): Announcements {
  const allAnnouncements = useAtomValue(announcementsAtom)

  return useMemo(() => {
    const env = isProdLike ? 'prod' : 'staging' // Should match what's set on CMS!

    return allAnnouncements.reduce<Announcements>((acc, announcement) => {
      if (
        announcement.chainIds.length === 0 ||
        announcement.chainIds.some(
          (announcementChain) =>
            (announcement.envs.length === 0 || announcement.envs.includes(env)) && announcementChain === chainId,
        )
      ) {
        acc[chainId] = announcement
      }

      return acc
    }, [])
  }, [chainId, allAnnouncements])
}

export function useCriticalAnnouncements(chainId: SupportedChainId): Announcements {
  const announcements = useAnnouncements(chainId)

  return announcements.filter(({ isCritical }) => isCritical)
}

export function useNonCriticalAnnouncements(chainId: SupportedChainId): Announcements {
  const announcements = useAnnouncements(chainId)

  return announcements.filter(({ isCritical }) => !isCritical)
}
