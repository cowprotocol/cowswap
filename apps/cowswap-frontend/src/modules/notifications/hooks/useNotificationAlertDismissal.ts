import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

import { getJotaiMergerStorage } from '@cowprotocol/core'

import { NOTIFICATION_SETTINGS_POPOVER_DISMISSAL_PERIOD_MS } from '../constants'

interface NotificationAlertDismissalState {
  dismissedAt: number | null
}
const STORAGE_KEY = 'notificationAlertPopoverDismissed:v0'

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

    // eslint-disable-next-line react-hooks/purity
    const timeSinceDismissal = Date.now() - state.dismissedAt
    return timeSinceDismissal < NOTIFICATION_SETTINGS_POPOVER_DISMISSAL_PERIOD_MS
  }, [state.dismissedAt])

  const dismiss = useCallback(() => {
    setState({ dismissedAt: Date.now() })
  }, [setState])

  return useMemo(() => ({ isDismissed, dismiss }), [isDismissed, dismiss])
}
