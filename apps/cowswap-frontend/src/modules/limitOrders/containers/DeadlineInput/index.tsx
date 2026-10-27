import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { TradeType } from '@cowprotocol/widget-lib'

import ms from 'ms.macro'

import { useInjectedWidgetDeadline } from 'modules/injectedWidget'
import { DeadlineSelector } from 'modules/limitOrders/pure/DeadlineSelector'
import {
  getLimitOrderDeadlines,
  LIMIT_ORDERS_DEADLINES,
  LimitOrderDeadline,
} from 'modules/limitOrders/pure/DeadlineSelector/deadlines'
import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders/state/limitOrdersSettingsAtom'

import { isCustomDeadlineExpired } from '../../utils/calculateLimitOrdersDeadline'

// setTimeout() delays over 2^31-1 ms (~24.8 days) overflow and fire too early
const MAX_TIMEOUT_MS = ms`24d`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DeadlineInput() {
  const { deadlineMilliseconds, customDeadlineTimestamp } = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const currentDeadlineNode = useRef<HTMLButtonElement>(undefined)
  const existingDeadline = useMemo(
    () => getLimitOrderDeadlines(deadlineMilliseconds).find((item) => item.value === deadlineMilliseconds),
    [deadlineMilliseconds],
  )

  const widgetDeadlineMinutes = useInjectedWidgetDeadline(TradeType.LIMIT)

  useEffect(() => {
    if (widgetDeadlineMinutes) {
      const widgetDeadlineDelta = widgetDeadlineMinutes * 60 * 1000
      const min = LIMIT_ORDERS_DEADLINES[0].value
      const max = LIMIT_ORDERS_DEADLINES[LIMIT_ORDERS_DEADLINES.length - 1].value

      let deadlineMilliseconds = widgetDeadlineDelta
      if (widgetDeadlineDelta < min) {
        deadlineMilliseconds = min
      } else if (widgetDeadlineDelta > max) {
        deadlineMilliseconds = max
      }

      updateSettingsState({ customDeadlineTimestamp: null, deadlineMilliseconds })
    }
  }, [widgetDeadlineMinutes, updateSettingsState])

  // calculateLimitOrdersDeadline() ignores a passed custom deadline, reset it on expiry to keep the selector in sync
  useEffect(() => {
    if (!customDeadlineTimestamp) return

    const resetCustomDeadline = (): void => updateSettingsState({ customDeadlineTimestamp: null })
    const now = Date.now()

    if (isCustomDeadlineExpired(customDeadlineTimestamp, now)) {
      resetCustomDeadline()
      return
    }

    const delay = customDeadlineTimestamp * 1000 - now

    if (delay > MAX_TIMEOUT_MS) return

    const timeout = setTimeout(resetCustomDeadline, delay)

    return () => clearTimeout(timeout)
  }, [customDeadlineTimestamp, updateSettingsState])

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
