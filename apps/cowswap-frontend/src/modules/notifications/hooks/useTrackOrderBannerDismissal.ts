import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

import { getJotaiMergerStorage } from '@cowprotocol/core'

const STORAGE_KEY = 'trackOrderNotificationBannerDismissed:v0'

const isTrackOrderBannerDismissedAtom = atomWithStorage<boolean>(STORAGE_KEY, false, getJotaiMergerStorage())

export interface UseTrackOrderBannerDismissalReturn {
  isDismissed: boolean
  dismiss: () => void
}

/**
 * Once dismissed, the "Track this order" trade-alerts prompt shown in the order submitted
 * screen should never be shown again on this device.
 */
export function useTrackOrderBannerDismissal(): UseTrackOrderBannerDismissalReturn {
  const [isDismissed, setIsDismissed] = useAtom(isTrackOrderBannerDismissedAtom)

  const dismiss = useCallback(() => {
    setIsDismissed(true)
  }, [setIsDismissed])

  return { isDismissed, dismiss }
}
