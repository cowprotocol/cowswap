import React, { useEffect, useRef, useState } from 'react'

import { UI, CenteredDots, LongLoadText } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import ms from 'ms.macro'
import styled from 'styled-components/macro'

import { useMediaQuery, upToMedium } from 'legacy/hooks/useMediaQuery'

const JUST_CLICKED_TIMEOUT = ms`1s`
const LONG_TEXT_LENGTH = 20

const ActionButton = styled.button<{ hasLongText$: boolean }>`
  display: flex;
  width: 100%;
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
  loading?: boolean
  id?: string
  onClick?(): void
}

export function TradeFormBlankButton({ onClick, children, disabled, loading, id }: TradeFormPrimaryButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hasLongText, setHasLongText] = useState(false)
  const [justClicked, setJustClicked] = useState(false)
  const isUpToMedium = useMediaQuery(upToMedium)

  const showLoader = justClicked || loading

  useEffect(() => {
    if (!ref?.current) return

    const text = ref.current.innerText

    setHasLongText(text.length > LONG_TEXT_LENGTH)
  }, [children])

  // Combine local onClick logic with incoming onClick
  const handleClick = () => {
    if (isUpToMedium) {
      window.scrollTo({ top: 0, left: 0 })
    }

    if (onClick) {
      onClick()
      setJustClicked(true)
    }
  }

  useEffect(() => {
    // Disable button for a short time after click
    if (justClicked) {
      setTimeout(() => {
        setJustClicked(false)
      }, JUST_CLICKED_TIMEOUT)
    }
  }, [justClicked])

  return (
    <ActionButton ref={ref} id={id} onClick={handleClick} disabled={showLoader || disabled} hasLongText$={hasLongText}>
      {showLoader ? (
        <>
          <LongLoadText>Confirm with your wallet </LongLoadText> <CenteredDots smaller />
        </>
      ) : (
        <Trans>{children}</Trans>
      )}
    </ActionButton>
  )
}
