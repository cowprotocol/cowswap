import { ReactNode } from 'react'

import EqualIcon from '@cowprotocol/assets/cow-swap/equal.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

type EqualSignVariant = 'default' | 'success'

const EqualSign = styled.div<{ size?: number; variant?: EqualSignVariant }>`
  --size: ${({ size }) => `${size ? size : 14}px`};
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: transparent;
  position: relative;
  color: inherit;

  &::before {
    content: '';
    background: ${({ variant = 'default' }) =>
      variant === 'success' ? `var(${UI.COLOR_SUCCESS_BG})` : `var(${UI.COLOR_TEXT})`};
    border-radius: var(--size);
    opacity: ${({ variant = 'default' }) => (variant === 'success' ? 1 : 0.15)};
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  > svg {
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: contain;

    > g {
      fill: ${({ variant = 'default' }) =>
        variant === 'success' ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT})`};
    }
  }
`

const Wrapper = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
`

interface ReceiveAmountTitleProps {
  children: ReactNode
  className?: string
  icon?: ReactNode
  variant?: EqualSignVariant
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ReceiveAmountTitle({ className, children, icon, variant }: ReceiveAmountTitleProps) {
  return (
    <Wrapper className={className}>
      {icon ? (
        typeof icon === 'string' ? (
          icon.endsWith('.svg') ? (
            <SVG src={icon} />
          ) : (
            <img src={icon} alt="icon" />
          )
        ) : (
          icon
        )
      ) : (
        <EqualSign variant={variant}>
          <SVG src={EqualIcon} />
        </EqualSign>
      )}{' '}
      {children}
    </Wrapper>
  )
}
