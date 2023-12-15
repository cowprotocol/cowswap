import React, { useEffect, useRef, useState } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

const LONG_TEXT_LENGTH = 20

const ActionButton = styled.button<{ hasLongText$: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font-size: ${({ hasLongText$ }) => (hasLongText$ ? '16px' : '18px')};
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
  min-height: 58px;
  text-align: center;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
  border: none;
  outline: none;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
  }

  &:disabled {
    background-color: var(${UI.COLOR_PAPER_DARKER});
    color: var(${UI.COLOR_TEXT_PAPER});
    background-image: none;
    border: 0;
    cursor: auto;
    animation: none;
    transform: none;
  }
`

export interface TradeFormPrimaryButtonProps {
  children: JSX.Element | string
  disabled?: boolean
  id?: string

  onClick?(): void
}

export function TradeFormBlankButton({ onClick, children, disabled, id }: TradeFormPrimaryButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hasLongText, setHasLongText] = useState(false)

  useEffect(() => {
    if (!ref?.current) return

    const text = ref.current.innerText

    setHasLongText(text.length > LONG_TEXT_LENGTH)
  }, [children])

  return (
    <ActionButton ref={ref} id={id} onClick={onClick} disabled={disabled} hasLongText$={hasLongText}>
      <Trans>{children}</Trans>
    </ActionButton>
  )
}
