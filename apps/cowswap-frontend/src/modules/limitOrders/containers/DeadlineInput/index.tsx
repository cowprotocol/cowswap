import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { TradeType } from '@cowprotocol/widget-lib'

import { useInjectedWidgetDeadline } from 'modules/injectedWidget'
import { DeadlineSelector } from 'modules/limitOrders/pure/DeadlineSelector'
import { LimitOrderDeadline, limitOrdersDeadlines } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'
import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders/state/limitOrdersSettingsAtom'

import { calculateMinMax } from '../../pure/DeadlineSelector/utils'

export function DeadlineInput() {
  const { deadlineMilliseconds, customDeadlineTimestamp } = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const currentDeadlineNode = useRef<HTMLButtonElement>()
  const existingDeadline = useMemo(() => {
    return limitOrdersDeadlines.find((item) => item.value === deadlineMilliseconds)
  }, [deadlineMilliseconds])

  const widgetDeadlineMinutes = useInjectedWidgetDeadline(TradeType.LIMIT)

  useEffect(() => {
    if (widgetDeadlineMinutes) {
      const widgetDeadlineDelta = widgetDeadlineMinutes * 60 * 1000

      const widgetTimestamp = (Date.now() + widgetDeadlineDelta) / 1000

      const [min, max] = calculateMinMax()
      const minTimestamp = min.getTime() / 1000
      const maxTimestamp = max.getTime() / 1000

      let customDeadlineTimestamp = widgetTimestamp
      if (widgetTimestamp < minTimestamp) {
        customDeadlineTimestamp = minTimestamp
      } else if (widgetTimestamp > maxTimestamp) {
        customDeadlineTimestamp = maxTimestamp
      }

      updateSettingsState({ customDeadlineTimestamp })
    }
  }, [widgetDeadlineMinutes, updateSettingsState])

  const isDeadlineDisabled = !!widgetDeadlineMinutes

  const selectDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      updateSettingsState({ deadlineMilliseconds: deadline.value, customDeadlineTimestamp: null })
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [updateSettingsState],
  )

  const selectCustomDeadline = useCallback(
    (customDeadline: number | null) => {
      updateSettingsState({ customDeadlineTimestamp: customDeadline })
    },
    [updateSettingsState],
  )

  return (
    <DeadlineSelector
      deadline={existingDeadline}
      customDeadline={customDeadlineTimestamp}
      isDeadlineDisabled={isDeadlineDisabled}
      selectDeadline={selectDeadline}
      selectCustomDeadline={selectCustomDeadline}
    />
  )
}
