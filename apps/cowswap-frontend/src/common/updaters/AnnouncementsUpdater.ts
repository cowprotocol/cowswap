import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { announcementsAtom, mapCmsAnnouncementsToAnnouncements } from '@cowprotocol/core'

import { useCmsAnnouncements } from 'common/hooks/useCmsAnnouncements'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AnnouncementsUpdater() {
  const setAnnouncements = useSetAtom(announcementsAtom)

  const cmsAnnouncements = useCmsAnnouncements()

  useEffect(() => {
    const announcements = mapCmsAnnouncementsToAnnouncements(cmsAnnouncements)

    announcements && setAnnouncements(announcements)
  }, [cmsAnnouncements, setAnnouncements])

  return null
}
