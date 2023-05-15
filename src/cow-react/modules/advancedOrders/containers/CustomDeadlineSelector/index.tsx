import * as styledEl from './styled'
import { GpModal as Modal } from '@cow/common/pure/Modal'
import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { CustomDeadline } from '../DeadlineSelector/types'
import { useState } from 'react'

type ModalProps = {
  isOpen: boolean
  onDismiss: () => void
  customDeadline: CustomDeadline
  selectCustomDeadline(deadline: CustomDeadline): void
}

export function CustomDeadlineSelector({ isOpen, onDismiss, customDeadline, selectCustomDeadline }: ModalProps) {
  const { hours, minutes } = customDeadline

  const [hoursValue, setHoursValue] = useState(hours || 0)
  const [minutesValue, setMinutesValue] = useState(minutes || 0)

  const onHoursChange = (v: string) => setHoursValue(Number(v))
  const onMinutesChange = (v: string) => setMinutesValue(Number(v))

  const onApply = () => {
    onDismiss()
    selectCustomDeadline({
      hours: hoursValue,
      minutes: minutesValue,
    })
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <styledEl.ModalWrapper>
        <styledEl.ModalHeader>
          <h3>
            <Trans>Define custom total time</Trans>
          </h3>
          <styledEl.CloseIcon onClick={onDismiss} />
        </styledEl.ModalHeader>

        <styledEl.ModalContent>
          <styledEl.FieldWrapper>
            <styledEl.FieldLabel>Hours</styledEl.FieldLabel>
            <styledEl.Input onUserInput={onHoursChange} value={hoursValue} />
          </styledEl.FieldWrapper>

          <styledEl.FieldWrapper>
            <styledEl.FieldLabel>Minutes</styledEl.FieldLabel>
            <styledEl.Input onUserInput={onMinutesChange} value={minutesValue} />
          </styledEl.FieldWrapper>
        </styledEl.ModalContent>

        <styledEl.ModalFooter>
          <styledEl.CancelButton onClick={onDismiss}>
            <Trans>Cancel</Trans>
          </styledEl.CancelButton>
          <ButtonPrimary onClick={onApply}>
            <Trans>Apply</Trans>
          </ButtonPrimary>
        </styledEl.ModalFooter>
      </styledEl.ModalWrapper>
    </Modal>
  )
}
