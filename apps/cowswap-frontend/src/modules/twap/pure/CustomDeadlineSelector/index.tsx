import { useCallback, useEffect, useState } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import ms from 'ms'

import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'

import { CowModal as Modal } from 'common/pure/Modal'

import * as styledEl from './styled'

type CustomDeadline = { hours: number; minutes: number }

interface CustomDeadlineSelectorProps {
  isOpen: boolean
  onDismiss: () => void
  customDeadline: CustomDeadline
  selectCustomDeadline(deadline: CustomDeadline): void
}

const MAX_TWAP_ORDER_DEADLINE = ms(`30d`) * 6 // ~ 6months
const MAX_DEADLINE_ERROR = 'Twap order deadline cannot be longer then 6 months'

export function CustomDeadlineSelector(props: CustomDeadlineSelectorProps) {
  const { isOpen, onDismiss, customDeadline, selectCustomDeadline } = props
  const { hours = 0, minutes = 0 } = customDeadline

  const [hoursValue, setHoursValue] = useState(hours)
  const [minutesValue, setMinutesValue] = useState(minutes)

  useEffect(() => setHoursValue(hours), [hours, isOpen])
  useEffect(() => setMinutesValue(minutes), [minutes, isOpen])

  const [error, setError] = useState<string | null>(null)

  const onHoursChange = useCallback((v: number | null) => setHoursValue(!v ? 0 : Math.round(v)), [])
  const onMinutesChange = useCallback((v: number | null) => setMinutesValue(!v ? 0 : Math.round(v)), [])

  const noValues = !hoursValue && !minutesValue
  const isDisabled = !!error || noValues

  const onApply = () => {
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

  useEffect(() => {
    const totalTime = ms(`${hoursValue}h`) + ms(`${minutesValue}m`)

    if (totalTime > MAX_TWAP_ORDER_DEADLINE) {
      setError(MAX_DEADLINE_ERROR)
    } else {
      setError(null)
    }
  }, [hoursValue, minutesValue])

  return (
    <Modal isOpen={isOpen} onDismiss={_onDismiss}>
      <styledEl.ModalWrapper>
        <styledEl.ModalHeader>
          <h3>
            <Trans>Define custom total time</Trans>
          </h3>
          <styledEl.CloseIcon onClick={_onDismiss} />
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

        {error && <styledEl.ErrorText>{error}</styledEl.ErrorText>}

        <styledEl.ModalFooter>
          <styledEl.CancelButton onClick={_onDismiss}>
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
