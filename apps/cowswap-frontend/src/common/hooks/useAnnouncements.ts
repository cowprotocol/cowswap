import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isProdLike } from '@cowprotocol/common-utils'
import { Announcements, announcementsAtom } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

function useAnnouncements(chainId: SupportedChainId): Announcements {
  const allAnnouncements = useAtomValue(announcementsAtom)

  return useMemo(() => {
    const env = isProdLike ? 'prod' : 'staging' // Should match what's set on CMS!

    return allAnnouncements
      .filter((announcement) => {
        const showForEveryChain = announcement.chainIds.length === 0
        const showForEveryEnv = announcement.envs.length === 0

        const matchesChainId = announcement.chainIds.some((announcementChain) => announcementChain === chainId)
        const matchesEnv = announcement.envs.some((announcementEnv) => announcementEnv === env)

        return (showForEveryChain || matchesChainId) && (showForEveryEnv || matchesEnv)
      })
      .sort((a, b) => {
        // A bit of duplication, yes, but this is to sort the filtered results and have some priority:
        // 1. first the most specific, with chain and env set
        // 2. second the ones with chain and any env
        // 3. third the ones with env and any chain
        // 4. lastly, the ones with any chain and any env

        const showForEveryChainA = a.chainIds.length === 0
        const showForEveryEnvA = a.envs.length === 0
        const matchesChainIdA = a.chainIds.some((announcementChain) => announcementChain === chainId)
        const matchesEnvA = a.envs.some((announcementEnv) => announcementEnv === env)

        const showForEveryChainB = b.chainIds.length === 0
        const showForEveryEnvB = b.envs.length === 0
        const matchesChainIdB = b.chainIds.some((announcementChain) => announcementChain === chainId)
        const matchesEnvB = b.envs.some((announcementEnv) => announcementEnv === env)

        if (matchesChainIdA && matchesEnvA) return -1
        if (matchesChainIdB && matchesEnvB) return 1
        if (matchesChainIdA && showForEveryEnvA) return -1
        if (matchesChainIdB && showForEveryEnvB) return 1
        if (showForEveryChainA && matchesEnvA) return -1
        if (showForEveryChainB && matchesEnvB) return 1
        if (showForEveryChainA && showForEveryEnvA) return -1
        if (showForEveryChainB && showForEveryEnvB) return 1
        return 0
      })
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
