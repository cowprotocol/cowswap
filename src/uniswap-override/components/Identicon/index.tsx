import React from 'react'
import IdenticonMod, { StyledIdenticon } from './IdenticonMod'
import styled from 'styled-components/macro'

const Wrapper = styled.div<{ size?: number }>`
  ${StyledIdenticon} {
    height: ${({ size }) => (size ? `${size}px` : '1rem')};
    width: ${({ size }) => (size ? `${size}px` : '1rem')};
    border-radius: ${({ size }) => (size ? `${size}px` : '1rem')};
  }
`

export interface IdenticonProps {
  size?: number
  account?: string
}

export default function Identicon({ account, size }: IdenticonProps) {
  return (
    <Wrapper size={size}>
      <IdenticonMod size={size} account={account} />
    </Wrapper>
  )
}
