import { ChangeEventHandler, KeyboardEventHandler, ReactNode, useCallback, useState } from 'react'

import styled from 'styled-components/macro'

import { ButtonError } from 'legacy/components/Button'

import { UI } from 'common/constants/theme'

const Container = styled.div``
const Instruction = styled.p`
  margin: 0;
  margin-bottom: 10px;
`
const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.border2};
  width: 100%;
  margin: 10px 0;
  margin-top: 0;
  padding: 10px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg3};
  color: var(${UI.COLOR_TEXT1});
  outline: none;
  font-size: 15px;

  &:focus {
    border: 1px solid ${({ theme }) => theme.blue2};
  }
`

interface ConfirmedButtonProps {
  className?: string
  onConfirm: () => void
  children?: ReactNode
  action: string
  confirmWord: string
  skipInput?: boolean
}

function isValidConfirm(value: string, confirmWord: string): boolean {
  return typeof value === 'string' && value.toLowerCase().trim() === confirmWord
}

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
      {shouldShowInput && <Input onChange={onInputChange} />}
      <ButtonError error padding={'12px'} disabled={shouldButtonBeDisabled} onClick={onConfirm}>
        {children}
      </ButtonError>
    </Container>
  )
}
