import { Identicon } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;

  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

export interface StatusIconProps {
  account?: string
  size?: number
}

export function StatusIcon({ account, size = 16 }: StatusIconProps) {
  const image = <Identicon account={account} />

  return <IconWrapper size={size}>{image}</IconWrapper>
}
