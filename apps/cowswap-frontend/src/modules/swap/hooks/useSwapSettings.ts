import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { StatefulValue } from '@cowprotocol/types'

import { updateSwapSettingsAtom, swapSettingsAtom } from '../state/swapSettingsAtom'

export function useSwapSettings() {
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

  return useMemo(
    () => [settings.showRecipient, (showRecipient: boolean) => updateState({ showRecipient })],
    [settings.showRecipient, updateState],
  )
}
