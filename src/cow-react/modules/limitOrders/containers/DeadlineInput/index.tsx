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
  const { deadlineMilliseconds, customDeadlineTimestamp } = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const currentDeadlineNode = useRef<HTMLButtonElement>()
  const existingDeadline = useMemo(() => {
    return limitOrdersDeadlines.find((item) => item.value === deadlineMilliseconds)
  }, [deadlineMilliseconds])

  const selectDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      updateSettingsState({ deadlineMilliseconds: deadline.value, customDeadlineTimestamp: null })
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [updateSettingsState]
  )

  const selectCustomDeadline = useCallback(
    (customDeadline: number | null) => {
      updateSettingsState({ customDeadlineTimestamp: customDeadline })
    },
    [updateSettingsState]
  )

  return (
    <DeadlineSelector
      deadline={existingDeadline}
      customDeadline={customDeadlineTimestamp}
      selectDeadline={selectDeadline}
      selectCustomDeadline={selectCustomDeadline}
    />
  )
}
