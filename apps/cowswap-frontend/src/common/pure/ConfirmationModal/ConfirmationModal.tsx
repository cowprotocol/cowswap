import { ChangeEventHandler, ReactNode, useCallback, useEffect, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { ConfirmBottomDrawerOrDialog } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './ConfirmationModal.styled'

export interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  description?: ReactNode
  warning?: string
  callToAction?: string
  onDismiss: Command
  onEnable: Command
  confirmWord: string
  action: string
  bottomContent?: ReactNode
  skipInput?: boolean
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  warning,
  callToAction,
  onDismiss,
  onEnable,
  action,
  confirmWord,
  bottomContent,
  skipInput = false,
}: ConfirmationModalProps): ReactNode {
  const [inputValue, setInputValue] = useState('')
  const shouldShowInput = !skipInput
  const confirmDisabled = shouldShowInput && !isValidConfirm(inputValue, confirmWord)

  useEffect(() => {
    if (!isOpen) {
      setInputValue('')
    }
  }, [isOpen])

  const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => setInputValue(event.target.value ?? ''),
    [],
  )

  const content = (
    <>
      {warning ? (
        <styledEl.Instruction>
          <styledEl.Warning>{warning}</styledEl.Warning>
        </styledEl.Instruction>
      ) : null}
      {shouldShowInput ? (
        <>
          <styledEl.Instruction>
            <Trans>
              Please type the word <strong>"{confirmWord}"</strong> to {action}.
            </Trans>
          </styledEl.Instruction>
          <styledEl.Input id="confirm-modal-input" onChange={onInputChange} />
        </>
      ) : (
        (bottomContent ?? (
          <styledEl.Instruction>
            <Trans>Please click confirm to {action}.</Trans>
          </styledEl.Instruction>
        ))
      )}
    </>
  )

  return (
    <ConfirmBottomDrawerOrDialog
      isOpen={isOpen}
      title={title}
      description={description}
      content={content}
      cancelLabel={<Trans>Cancel</Trans>}
      onCancel={onDismiss}
      confirmLabel={callToAction ? callToAction : <Trans>Confirm</Trans>}
      onConfirm={onEnable}
      confirmDisabled={confirmDisabled}
    />
  )
}

function isValidConfirm(value: string, confirmWord: string): boolean {
  return typeof value === 'string' && value.toLowerCase().trim() === confirmWord
}
