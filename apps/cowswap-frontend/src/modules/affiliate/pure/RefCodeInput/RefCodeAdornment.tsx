import { ReactNode } from 'react'

import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import PendingIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import LinkedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import SVG from 'react-inlinesvg'
import styled, { css, keyframes } from 'styled-components/macro'

export type RefCodeAdornmentVariant = 'error' | 'lock' | 'pending' | 'checking' | 'success' | 'available'

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

  if (variant === 'lock') {
    return (
      <RefCodeAdornmentContainer variant="lock">
        <SVG src={LinkedIcon} title={t`Linked`} />
        <span>{t`Linked`}</span>
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
    <RefCodeAdornmentContainer variant="success">
      <SVG src={CheckIcon} title={t`Valid`} />
      <span>{t`Valid`}</span>
    </RefCodeAdornmentContainer>
  )
}

const ADORNMENT_COLOR_MAP: Record<RefCodeAdornmentVariant, string> = {
  error: `var(${UI.COLOR_DANGER_TEXT})`,
  lock: `var(${UI.COLOR_INFO_TEXT})`,
  pending: `var(${UI.COLOR_ALERT_TEXT})`,
  checking: `var(${UI.COLOR_ALERT_TEXT})`,
  success: `var(${UI.COLOR_SUCCESS})`,
  available: `var(${UI.COLOR_SUCCESS})`,
}

const ADORNMENT_PATH_COLOR_MAP: Record<RefCodeAdornmentVariant, string> = {
  error: `var(${UI.COLOR_DANGER_TEXT})`,
  lock: 'currentColor',
  pending: 'currentColor',
  checking: 'currentColor',
  success: 'currentColor',
  available: 'currentColor',
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
  min-width: 72px;
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${({ variant }) => ADORNMENT_COLOR_MAP[variant]};

  svg {
    width: 18px;
    height: 18px;
    fill: ${({ variant }) => ADORNMENT_PATH_COLOR_MAP[variant]};
  }

  svg > path {
    fill: ${({ variant }) => ADORNMENT_PATH_COLOR_MAP[variant]};
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
  min-width: 72px;
  height: 18px;
  flex: 0 0 auto;
  visibility: hidden;
`
