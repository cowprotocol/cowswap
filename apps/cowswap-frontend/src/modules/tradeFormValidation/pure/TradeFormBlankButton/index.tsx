import React, { useEffect, useRef, useState } from 'react'

import { Trans } from '@lingui/macro'
import { lighten, transparentize } from 'polished'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

const LONG_TEXT_LENGTH = 20

const ActionButton = styled.button<{ hasLongText$: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.white};
  font-size: ${({ hasLongText$ }) => (hasLongText$ ? '16px' : '18px')};
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
  min-height: 58px;
  text-align: center;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
  border: none;
  outline: none;

  &:hover {
    background: ${({ theme }) => lighten(0.08, theme.bg2)};
  }

  &:disabled {
    background-color: var(${UI.COLOR_GREY});
    color: ${({ theme }) => transparentize(0.4, theme.text1)};
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
