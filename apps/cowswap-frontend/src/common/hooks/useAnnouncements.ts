import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isProdLike } from '@cowprotocol/common-utils'
import { Announcement, Announcements, announcementsAtom } from '@cowprotocol/core'
import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

function getAnnouncementSpecificity(chainId: SupportedChainId, env: CowEnv, announcement: Announcement): number {
  let specificity = 0

  const matchesChain = announcement.chainIds.some((announcementChain) => announcementChain === chainId)
  const matchesEnv = announcement.envs.some((announcementEnv) => announcementEnv === env)
  const matchesEveryChain = announcement.chainIds.length === 0
  const matchesEveryEnv = announcement.envs.length === 0

  if (matchesChain) specificity += 2
  if (matchesEnv) specificity += 2
  if (matchesEveryChain) specificity += 1
  if (matchesEveryEnv) specificity += 1

  return specificity
}

function useAnnouncements(chainId: SupportedChainId): Announcements {
  const allAnnouncements = useAtomValue(announcementsAtom)

  return useMemo(() => {
    const env = isProdLike ? 'prod' : 'staging'

    const filtered = allAnnouncements
      .filter((announcement) => {
        const showForEveryChain = announcement.chainIds.length === 0
        const showForEveryEnv = announcement.envs.length === 0

        const matchesChainId = announcement.chainIds.some((announcementChain) => announcementChain === chainId)
        const matchesEnv = announcement.envs.some((announcementEnv) => announcementEnv === env)

        return (showForEveryChain || matchesChainId) && (showForEveryEnv || matchesEnv)
      })
      .sort((a, b) => {
        const specificityA = getAnnouncementSpecificity(chainId, env, a)
        const specificityB = getAnnouncementSpecificity(chainId, env, b)

        return specificityB - specificityA
      })

    return filtered
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
