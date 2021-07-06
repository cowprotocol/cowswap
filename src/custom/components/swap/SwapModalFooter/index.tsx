import React from 'react'
import SwapModalFooterMod, { SwapModalFooterProps } from './SwapModalFooterMod'
import { StyledBalanceMaxMini } from 'components/swap/styleds'
import { RowBetween, RowFixed } from 'components/Row'
import styled from 'styled-components'

const Wrapper = styled.div`
  ${StyledBalanceMaxMini} {
    background: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
  }

  ${RowBetween} > div,
  ${RowFixed} > div {
    color: ${({ theme }) => theme.text1};
  }
`

export default function SwapModalFooter(props: SwapModalFooterProps) {
  return (
    <Wrapper>
      <SwapModalFooterMod {...props} />
    </Wrapper>
  )
}
