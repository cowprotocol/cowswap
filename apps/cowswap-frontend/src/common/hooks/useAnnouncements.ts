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
      const showForEveryChain = announcement.chainIds.length === 0
      const showForEveryEnv = announcement.envs.length === 0

      const matchesChainIdAndEnv = announcement.chainIds.some((announcementChain) => {
        const matchesCurrentEnv = announcement.envs.includes(env)
        const matchesCurrentChainId = announcementChain === chainId
        return (showForEveryEnv || matchesCurrentEnv) && (showForEveryChain || matchesCurrentChainId)
      })

      if ((showForEveryChain && showForEveryEnv) || matchesChainIdAndEnv) {
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
