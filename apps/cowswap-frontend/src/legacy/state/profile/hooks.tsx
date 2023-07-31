import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from 'legacy/state/hooks'

import { closeAnnouncement } from './actions'

export function useAnnouncementVisible(contentHash?: string): boolean {
  const announcementVisible = useAppSelector((state) => state.profile.announcementVisible)

  // No hash, no visible
  if (!contentHash) {
    return false
  }

  // If the hash has been closed, will return false,
  // if its a new hash returns true (visible)
  return announcementVisible[contentHash] ?? true
}

export function useCloseAnnouncement(): (contentHash?: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (contentHash?: string) => {
      if (contentHash) {
        dispatch(closeAnnouncement({ contentHash }))
      }
    },
    [dispatch]
  )
}
