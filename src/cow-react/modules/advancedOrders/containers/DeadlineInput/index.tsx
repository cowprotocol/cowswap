// eslint-disable-next-line no-restricted-imports
import { Trans } from '@lingui/macro'
import {
  advancedOrdersSettingsAtom,
  updateAdvancedOrdersSettingsAtom,
} from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo, useRef } from 'react'
import { DeadlineSelector } from '@cow/common/pure/DeadlineSelector'
import { OrderDeadline, ordersDeadlines } from '@cow/common/pure/DeadlineSelector/deadlines'
import QuestionHelper from 'components/QuestionHelper'
import * as styledEl from './styled'

export function DeadlineInput() {
  const { deadlineMilliseconds, customDeadlineTimestamp } = useAtomValue(advancedOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateAdvancedOrdersSettingsAtom)
  const currentDeadlineNode = useRef<HTMLButtonElement>()
  const existingDeadline = useMemo(() => {
    return ordersDeadlines.find((item) => item.value === deadlineMilliseconds)
  }, [deadlineMilliseconds])

  const selectDeadline = useCallback(
    (deadline: OrderDeadline) => {
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

  // TODO: update text
  const label = (
    <styledEl.LabelWrapper>
      <span>Total time</span>
      <QuestionHelper text={<Trans>This is some text here</Trans>} />
    </styledEl.LabelWrapper>
  )

  return (
    <DeadlineSelector
      inline
      label={label}
      orderType={'TWAP'}
      minHeight="50px"
      deadline={existingDeadline}
      customDeadline={customDeadlineTimestamp}
      selectDeadline={selectDeadline}
      selectCustomDeadline={selectCustomDeadline}
    />
  )
}
