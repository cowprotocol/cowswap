import { ReactNode } from 'react'

import AlertIcon from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import PendingIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import { UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import SVG from 'react-inlinesvg'
import styled, { css, keyframes } from 'styled-components/macro'

export type RefCodeAdornmentVariant = 'error' | 'pending' | 'checking' | 'valid' | 'available'
type RefCodeAdornmentPlacement = 'inline' | 'below'

interface RefCodeAdornmentProps {
  variant?: RefCodeAdornmentVariant
  placement?: RefCodeAdornmentPlacement
  label?: string
}

export function RefCodeAdornment({ variant, placement = 'inline', label }: RefCodeAdornmentProps): ReactNode {
  if (!variant) {
    if (placement === 'below') {
      return null
    }

    return <RefCodeAdornmentPlaceholder aria-hidden="true" />
  }

  const statusLabel = label ?? getDefaultAdornmentLabel(variant)
  const showLabel = placement === 'below' || variant !== 'error'
  const icon =
    variant === 'error' ? AlertIcon : variant === 'pending' || variant === 'checking' ? PendingIcon : CheckIcon

  return (
    <RefCodeAdornmentContainer variant={variant} isSpinning={variant === 'checking'} $placement={placement}>
      <SVG src={icon} title={statusLabel} />
      {showLabel && <span>{statusLabel}</span>}
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

const ADORNMENT_BG_MAP: Record<RefCodeAdornmentVariant, string> = {
  error: `var(${UI.COLOR_DANGER_BG})`,
  pending: `var(${UI.COLOR_ALERT_BG})`,
  checking: `var(${UI.COLOR_ALERT_BG})`,
  valid: `var(${UI.COLOR_SUCCESS_BG})`,
  available: `var(${UI.COLOR_SUCCESS_BG})`,
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const RefCodeAdornmentContainer = styled.div<{
  variant: RefCodeAdornmentVariant
  isSpinning?: boolean
  $placement: RefCodeAdornmentPlacement
}>`
  display: flex;
  align-items: center;
  justify-content: ${({ $placement }) => ($placement === 'below' ? 'flex-start' : 'flex-end')};
  gap: 6px;
  min-width: ${({ $placement }) => ($placement === 'below' ? '0' : '92px')};
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${({ variant }) => ADORNMENT_COLOR_MAP[variant]};
  background: ${({ $placement, variant }) => ($placement === 'below' ? ADORNMENT_BG_MAP[variant] : 'transparent')};
  border: 0;
  border-radius: ${({ $placement }) => ($placement === 'below' ? '0 0 9px 9px' : '0')};
  padding: ${({ $placement }) => ($placement === 'below' ? '8px 12px' : '0')};
  width: ${({ $placement }) => ($placement === 'below' ? '100%' : 'auto')};
  min-height: ${({ $placement }) => ($placement === 'below' ? '40px' : 'auto')};

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

  span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const RefCodeAdornmentPlaceholder = styled.div`
  min-width: 92px;
  height: 18px;
  flex: 0 0 auto;
  visibility: hidden;
`

function getDefaultAdornmentLabel(variant: RefCodeAdornmentVariant): string {
  if (variant === 'error') return t`Invalid code`
  if (variant === 'checking') return t`Checking`
  if (variant === 'pending') return t`Pending`
  if (variant === 'available') return t`Available`
  return t`Valid`
}
