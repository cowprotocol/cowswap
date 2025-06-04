import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { StatefulValue } from '@cowprotocol/types'

import { updateYieldSettingsAtom, yieldSettingsAtom } from '../state/yieldSettingsAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

export function useYieldUnlockState(): StatefulValue<boolean> {
  const updateState = useSetAtom(updateYieldSettingsAtom)
  const settings = useYieldSettings()

  return useMemo(
    () => [settings.isUnlocked, (isUnlocked: boolean) => updateState({ isUnlocked })],
    [settings.isUnlocked, updateState],
  )
}
