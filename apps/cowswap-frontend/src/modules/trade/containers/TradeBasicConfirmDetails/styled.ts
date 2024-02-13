import styled from 'styled-components/macro'

import { RateInfo } from 'common/pure/RateInfo'

export const Wrapper = styled.div`
  padding: 0 6px;
  font-size: 13px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
  `}
`

export const StyledRateInfo = styled(RateInfo)`
  margin: 0 auto;
  font-size: 13px;
  min-height: 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
    gap: 2px;
    align-items: flex-start;
    margin: 0 0 10px;
  `}
`

export const ItemWithArrow = styled.div`
  display: flex;
  align-items: center;

  > svg:first-child {
    margin-right: 5px;
  }
`
