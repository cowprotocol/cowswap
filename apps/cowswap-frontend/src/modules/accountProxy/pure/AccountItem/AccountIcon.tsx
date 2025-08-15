import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'
import { JazzIcon } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

const AccountIconWrapper = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  flex-shrink: 0;
  overflow: hidden;
`

interface AccountIconProps {
  account: string
  size?: number
}

export function AccountIcon({ account, size = 20 }: AccountIconProps): ReactNode {
  return (
    <AccountIconWrapper size={size}>
      <JazzIcon account={account} size={size} />
    </AccountIconWrapper>
  )
}
