import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { StatefulValue } from '@cowprotocol/types'

import { useUpdateSwapRawState } from './useUpdateSwapRawState'

import { swapSettingsAtom, SwapSettingsState, updateSwapSettingsAtom } from '../state/swapSettingsAtom'

export function useSwapSettings(): SwapSettingsState {
  return useAtomValue(swapSettingsAtom)
}

export function useSwapDeadlineState(): StatefulValue<number> {
  const updateState = useSetAtom(updateSwapSettingsAtom)
  const settings = useSwapSettings()

  return useMemo(
    () => [settings.deadline, (deadline: number) => updateState({ deadline })],
    [settings.deadline, updateState],
  )
}

export function useSwapRecipientToggleState(): StatefulValue<boolean> {
  const updateState = useSetAtom(updateSwapSettingsAtom)
  const settings = useSwapSettings()
  const updateSwapRawState = useUpdateSwapRawState()

  return useMemo(
    () => [
      settings.showRecipient,
      (showRecipient: boolean) => {
        updateState({ showRecipient })
        if (!showRecipient) {
          updateSwapRawState({ recipient: undefined, recipientAddress: undefined })
        }
      },
    ],
    [settings.showRecipient, updateState, updateSwapRawState],
  )
}

const emptyState = [null, null]

export function useSwapPartialApprovalToggleState(isFeatureEnabled = false): StatefulValue<boolean> | [null, null] {
  const updateState = useSetAtom(updateSwapSettingsAtom)
  const settings = useSwapSettings()

  return useMemo(() => {
    if (!isFeatureEnabled) {
      return emptyState as [null, null]
    }

    return [
      settings.enablePartialApprovalBySettings,
      (enablePartialApproval: boolean) => updateState({ enablePartialApprovalBySettings: enablePartialApproval }),
    ]
  }, [settings.enablePartialApprovalBySettings, updateState, isFeatureEnabled])
}
