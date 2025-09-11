import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

import { getJotaiMergerStorage } from '@cowprotocol/core'

interface NotificationAlertDismissalState {
  dismissedAt: number | null
}

const DISMISSAL_DURATION_MS = 180 * 24 * 60 * 60 * 1000 // 180 days
const STORAGE_KEY = 'notificationAlertTooltipDismissed:v0'

const DEFAULT_STATE: NotificationAlertDismissalState = {
  dismissedAt: null,
}

const notificationAlertDismissalAtom = atomWithStorage<NotificationAlertDismissalState>(
  STORAGE_KEY,
  DEFAULT_STATE,
  getJotaiMergerStorage(),
)

export interface UseNotificationAlertDismissalReturn {
  isDismissed: boolean
  dismiss: () => void
}

export function useNotificationAlertDismissal(): UseNotificationAlertDismissalReturn {
  const [state, setState] = useAtom(notificationAlertDismissalAtom)

  const isDismissed = useMemo(() => {
    if (!state.dismissedAt) {
      return false
    }

    const timeSinceDismissal = Date.now() - state.dismissedAt
    return timeSinceDismissal < DISMISSAL_DURATION_MS
  }, [state.dismissedAt])

  const dismiss = useCallback(() => {
    setState({ dismissedAt: Date.now() })
  }, [setState])

  return useMemo(() => ({ isDismissed, dismiss }), [isDismissed, dismiss])
}
