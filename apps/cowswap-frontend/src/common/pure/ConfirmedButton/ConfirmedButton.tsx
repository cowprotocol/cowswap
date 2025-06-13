import { ChangeEventHandler, KeyboardEventHandler, ReactNode, useCallback, useState } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonError } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const Container = styled.div``
const Instruction = styled.p`
  margin: 0;
  margin-bottom: 10px;
`
const Input = styled.input`
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  width: 100%;
  margin: 10px 0;
  margin-top: 0;
  padding: 10px;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  font-weight: bold;

  &:focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`
interface ConfirmedButtonProps {
  className?: string
  onConfirm: Command
  children?: ReactNode
  action: string
  confirmWord: string
  skipInput?: boolean
}

function isValidConfirm(value: string, confirmWord: string): boolean {
  return typeof value === 'string' && value.toLowerCase().trim() === confirmWord
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConfirmedButton({
  className,
  onConfirm,
  children,
  action,
  confirmWord,
  skipInput = false,
}: ConfirmedButtonProps) {
  const [inputValue, setInputValue] = useState('')
  const onInputChange: ChangeEventHandler<HTMLInputElement> = (event) => setInputValue(event.target.value ?? '')
  const shouldShowInput = !skipInput
  const shouldButtonBeDisabled = shouldShowInput && !isValidConfirm(inputValue, confirmWord)
  const onKeyDown: KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key.toLowerCase() !== 'enter' || shouldButtonBeDisabled) {
        return
      }

      onConfirm()
    },
    [onConfirm, shouldButtonBeDisabled]
  )

  return (
    <Container className={className} onKeyDown={onKeyDown}>
      {shouldShowInput ? (
        <Instruction>
          Please type the word <strong>"{confirmWord}"</strong> to {action}.
        </Instruction>
      ) : (
        <Instruction>Please click confirm to {action}.</Instruction>
      )}
      {shouldShowInput && <Input id="confirm-modal-input" onChange={onInputChange} />}
      <ButtonError
        id="confirm-modal-button"
        error
        padding={'12px'}
        disabled={shouldButtonBeDisabled}
        onClick={onConfirm}
      >
        {children}
      </ButtonError>
    </Container>
  )
}
