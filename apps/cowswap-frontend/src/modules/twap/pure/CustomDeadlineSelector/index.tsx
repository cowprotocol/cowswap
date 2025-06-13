import { useCallback, useEffect, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { CowModal as Modal } from 'common/pure/Modal'

import * as styledEl from './styled'

type CustomDeadline = { hours: number; minutes: number }

interface CustomDeadlineSelectorProps {
  isOpen: boolean
  onDismiss: Command
  customDeadline: CustomDeadline
  selectCustomDeadline(deadline: CustomDeadline): void
}
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function CustomDeadlineSelector(props: CustomDeadlineSelectorProps) {
  const { isOpen, onDismiss, customDeadline, selectCustomDeadline } = props
  const { hours = 0, minutes = 0 } = customDeadline
  const analytics = useCowAnalytics()

  const [hoursValue, setHoursValue] = useState(hours)
  const [minutesValue, setMinutesValue] = useState(minutes)

  useEffect(() => setHoursValue(hours), [hours, isOpen])
  useEffect(() => setMinutesValue(minutes), [minutes, isOpen])

  const onHoursChange = useCallback((v: number | null) => setHoursValue(!v ? 0 : Math.round(v)), [])
  const onMinutesChange = useCallback((v: number | null) => setMinutesValue(!v ? 0 : Math.round(v)), [])

  const isDisabled = !hoursValue && !minutesValue

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const onApply = () => {
    analytics.sendEvent({
      category: CowSwapAnalyticsCategory.TWAP,
      action: 'Apply custom deadline',
      label: `${hoursValue}h ${minutesValue}m`,
    })
    onDismiss()
    selectCustomDeadline({
      hours: hoursValue,
      minutes: minutesValue,
    })
  }

  const _onDismiss = useCallback(() => {
    setHoursValue(hours || 0)
    setMinutesValue(minutes || 0)
    onDismiss()
  }, [hours, minutes, onDismiss])

  return (
    <Modal isOpen={isOpen} onDismiss={_onDismiss}>
      <styledEl.ModalWrapper>
        <styledEl.ModalHeader>
          <h3>
            <Trans>Define custom total time</Trans>
          </h3>
          <styledEl.CloseIcon
            onClick={_onDismiss}
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.TWAP,
              action: 'Close custom deadline selector',
            })}
          />
        </styledEl.ModalHeader>

        <styledEl.ModalContent>
          <TradeNumberInput
            label="Hours"
            onUserInput={onHoursChange}
            value={hoursValue}
            showUpDownArrows
            min={0}
            max={null}
          />
          <TradeNumberInput
            label="Minutes"
            onUserInput={onMinutesChange}
            value={minutesValue}
            showUpDownArrows
            min={0}
            max={null}
          />
        </styledEl.ModalContent>

        <styledEl.ModalFooter>
          <styledEl.CancelButton
            onClick={_onDismiss}
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.TWAP,
              action: 'Cancel custom deadline selection',
            })}
          >
            <Trans>Cancel</Trans>
          </styledEl.CancelButton>
          <ButtonPrimary disabled={isDisabled} onClick={onApply}>
            <Trans>Apply</Trans>
          </ButtonPrimary>
        </styledEl.ModalFooter>
      </styledEl.ModalWrapper>
    </Modal>
  )
}
