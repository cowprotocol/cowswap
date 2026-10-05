import { ChangeEventHandler, ReactNode, useCallback, useEffect, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { ConfirmBottomDrawerOrDialog } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './ConfirmationModal.styled'

export interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  description?: ReactNode
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
  const showDefaultClickInstruction = !shouldShowInput && bottomContent === undefined

  useEffect(() => {
    if (!isOpen) {
      setInputValue('')
    }
  }, [isOpen])

  const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => setInputValue(event.target.value ?? ''),
    [],
  )

  const instruction = shouldShowInput ? (
    <Trans>
      Please type the word <strong>"{confirmWord}"</strong> to {action}.
    </Trans>
  ) : showDefaultClickInstruction ? (
    <Trans>Please click confirm to {action}.</Trans>
  ) : null

  const descriptionContent =
    description || instruction ? (
      <>
        {description ? <p>{description}</p> : null}
        {instruction ? <p>{instruction}</p> : null}
      </>
    ) : undefined

  const content = (
    <>
      {shouldShowInput ? <styledEl.Input id="confirm-modal-input" onChange={onInputChange} /> : null}
      {!shouldShowInput && bottomContent !== undefined ? bottomContent : null}
    </>
  )

  return (
    <ConfirmBottomDrawerOrDialog
      isOpen={isOpen}
      title={title}
      description={descriptionContent}
      content={content}
      cancelLabel={<Trans>Cancel</Trans>}
      onCancel={onDismiss}
      confirmLabel={callToAction ? callToAction : <Trans>Confirm</Trans>}
      onConfirm={onEnable}
      confirmDisabled={confirmDisabled}
      confirmVariant="error"
      footerTopBorder
    />
  )
}

function isValidConfirm(value: string, confirmWord: string): boolean {
  return typeof value === 'string' && value.toLowerCase().trim() === confirmWord
}
