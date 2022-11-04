import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo, useRef } from 'react'
import { DeadlineSelector } from '@cow/modules/limitOrders/pure/DeadlineSelector'
import { LimitOrderDeadline, limitOrdersDeadlines } from '@cow/modules/limitOrders/pure/DeadlineSelector/deadlines'

export function DeadlineInput() {
  const { deadline, customDeadline } = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const currentDeadlineNode = useRef<HTMLButtonElement>()
  const existingDeadline = useMemo(() => {
    return limitOrdersDeadlines.find((item) => item.value === deadline)
  }, [deadline])

  const selectDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      updateSettingsState({ deadline: deadline.value, customDeadline: null })
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [updateSettingsState]
  )

  const selectCustomDeadline = useCallback(
    (customDeadline: number) => {
      updateSettingsState({ customDeadline })
    },
    [updateSettingsState]
  )

  return (
    <DeadlineSelector
      deadline={existingDeadline}
      customDeadline={customDeadline}
      selectDeadline={selectDeadline}
      selectCustomDeadline={selectCustomDeadline}
    />
  )
}
