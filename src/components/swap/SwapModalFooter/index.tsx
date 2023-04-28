import SwapModalFooterMod, { SwapModalFooterProps } from './SwapModalFooterMod'
import { RowBetween, RowFixed } from 'components/Row'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
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
