import { ReactNode } from 'react'

import EqualIcon from '@cowprotocol/assets/cow-swap/equal.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

const EqualSign = styled.div<{ size?: number }>`
  --size: ${({ size }) => `${size ? size : 14}px`};
  padding: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: var(${UI.COLOR_PAPER_DARKER});

  > svg {
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: contain;
  }
`

const Wrapper = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`

interface ReceiveAmountTitleProps {
  children: ReactNode
  className?: string
}

export function ReceiveAmountTitle({ className, children }: ReceiveAmountTitleProps) {
  return (
    <Wrapper className={className}>
      <EqualSign>
        <SVG src={EqualIcon} />
      </EqualSign>{' '}
      <Text>
        <b>{children}</b>
      </Text>
    </Wrapper>
  )
}
