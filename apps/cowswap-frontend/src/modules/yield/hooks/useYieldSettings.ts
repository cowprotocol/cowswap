import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/index'
import { useMemo } from 'react'

import { StatefulValue } from '@cowprotocol/types'

import { updateYieldSettingsAtom, yieldSettingsAtom } from '../state/yieldSettingsAtom'

export function useYieldSettings() {
  return useAtomValue(yieldSettingsAtom)
}

export function useYieldDeadlineState(): StatefulValue<number> {
  const updateState = useSetAtom(updateYieldSettingsAtom)
  const settings = useYieldSettings()

  return useMemo(
    () => [settings.deadline, (deadline: number) => updateState({ deadline })],
    [settings.deadline, updateState],
  )
}
export function useYieldRecipientToggleState(): StatefulValue<boolean> {
  const updateState = useSetAtom(updateYieldSettingsAtom)
  const settings = useYieldSettings()

  return useMemo(
    () => [settings.showRecipient, (showRecipient: boolean) => updateState({ showRecipient })],
    [settings.showRecipient, updateState],
  )
}
