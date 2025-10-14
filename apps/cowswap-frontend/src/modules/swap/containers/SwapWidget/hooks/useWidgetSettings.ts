import { useMemo } from 'react'

import { useHooksEnabledManager } from 'legacy/state/user/hooks'

import { useSwapSettings, useSwapDeadlineState, useSwapRecipientToggleState } from '../../../hooks/useSwapSettings'

export interface WidgetSettings {
  showRecipient: boolean
  deadlineState: ReturnType<typeof useSwapDeadlineState>
  recipientToggleState: ReturnType<typeof useSwapRecipientToggleState>
  hooksEnabledState: ReturnType<typeof useHooksEnabledManager>
}

export function useWidgetSettings(): WidgetSettings {
  const { showRecipient } = useSwapSettings()
  const deadlineState = useSwapDeadlineState()
  const recipientToggleState = useSwapRecipientToggleState()
  const hooksEnabledState = useHooksEnabledManager()

  return useMemo(
    () => ({ showRecipient, deadlineState, recipientToggleState, hooksEnabledState }),
    [showRecipient, deadlineState, recipientToggleState, hooksEnabledState],
  )
}
