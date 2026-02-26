import { ReactNode } from 'react'

import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import PendingIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import { UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import SVG from 'react-inlinesvg'
import styled, { css, keyframes } from 'styled-components/macro'

export type RefCodeAdornmentVariant = 'error' | 'pending' | 'checking' | 'valid' | 'available'

interface RefCodeAdornmentProps {
  variant?: RefCodeAdornmentVariant
}

export function RefCodeAdornment({ variant }: RefCodeAdornmentProps): ReactNode {
  if (!variant) {
    return <RefCodeAdornmentPlaceholder aria-hidden="true" />
  }

  if (variant === 'error') {
    return (
      <RefCodeAdornmentContainer variant="error">
        <SVG src={AlertIcon} title={t`Invalid code`} />
      </RefCodeAdornmentContainer>
    )
  }

  if (variant === 'checking') {
    return (
      <RefCodeAdornmentContainer variant="checking" isSpinning>
        <SVG src={PendingIcon} title={t`Checking`} />
        <span>{t`Checking`}</span>
      </RefCodeAdornmentContainer>
    )
  }

  if (variant === 'pending') {
    return (
      <RefCodeAdornmentContainer variant="pending">
        <SVG src={PendingIcon} title={t`Pending`} />
        <span>{t`Pending`}</span>
      </RefCodeAdornmentContainer>
    )
  }

  if (variant === 'available') {
    return (
      <RefCodeAdornmentContainer variant="available">
        <SVG src={CheckIcon} title={t`Available`} />
        <span>{t`Available`}</span>
      </RefCodeAdornmentContainer>
    )
  }

  return (
    <RefCodeAdornmentContainer variant="valid">
      <SVG src={CheckIcon} title={t`Valid`} />
      <span>{t`Valid`}</span>
    </RefCodeAdornmentContainer>
  )
}

const ADORNMENT_COLOR_MAP: Record<RefCodeAdornmentVariant, string> = {
  error: `var(${UI.COLOR_DANGER_TEXT})`,
  pending: `var(${UI.COLOR_ALERT_TEXT})`,
  checking: `var(${UI.COLOR_ALERT_TEXT})`,
  valid: `var(${UI.COLOR_SUCCESS})`,
  available: `var(${UI.COLOR_SUCCESS})`,
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RefCodeAdornmentContainer = styled.div<{ variant: RefCodeAdornmentVariant; isSpinning?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 92px;
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${({ variant }) => ADORNMENT_COLOR_MAP[variant]};

  svg {
    width: 16px;
    height: 16px;
    fill: ${({ variant }) => (variant === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : 'currentColor')};
  }

  svg > path {
    fill: ${({ variant }) => (variant === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : 'currentColor')};
  }

  ${({ variant, isSpinning }) =>
    (variant === 'pending' || variant === 'checking') &&
    isSpinning &&
    css`
      svg {
        animation: ${spin} 1.1s linear infinite;
      }
    `}
`

const RefCodeAdornmentPlaceholder = styled.div`
  min-width: 92px;
  height: 18px;
  flex: 0 0 auto;
  visibility: hidden;
`
