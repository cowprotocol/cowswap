import { CmsAnnouncements, getAnnouncements } from '@cowprotocol/core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

const ANNOUNCEMENTS_SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`5min`, // we do need to show this sort of ASAP
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
}

const EMPTY_VALUE: CmsAnnouncements = []

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCmsAnnouncements() {
  const { data } = useSWR<CmsAnnouncements, Error, string>('/announcements', getAnnouncements, ANNOUNCEMENTS_SWR_CONFIG)

  return data || EMPTY_VALUE
}
