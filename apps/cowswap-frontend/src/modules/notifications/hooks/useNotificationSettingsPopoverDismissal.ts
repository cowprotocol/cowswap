import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

import { getJotaiMergerStorage } from '@cowprotocol/core'

interface NotificationSettingsPopoverDismissalState {
  dismissedAt: number | null
}

const STORAGE_KEY = 'notificationSettingsPopoverDismissed:v0'

const DEFAULT_STATE: NotificationSettingsPopoverDismissalState = {
  dismissedAt: null,
}

const notificationSettingsPopoverDismissalAtom = atomWithStorage<NotificationSettingsPopoverDismissalState>(
  STORAGE_KEY,
  DEFAULT_STATE,
  getJotaiMergerStorage(),
)

export interface UseNotificationSettingsPopoverDismissalReturn {
  isDismissed: boolean
  dismiss: () => void
}

export function useNotificationSettingsPopoverDismissal(): UseNotificationSettingsPopoverDismissalReturn {
  const [state, setState] = useAtom(notificationSettingsPopoverDismissalAtom)

  const isDismissed = useMemo(() => {
    return !!state.dismissedAt
  }, [state.dismissedAt])

  const dismiss = useCallback(() => {
    setState({ dismissedAt: Date.now() })
  }, [setState])

  const value = useMemo(() => ({ isDismissed, dismiss }), [isDismissed, dismiss])

  return value
}
