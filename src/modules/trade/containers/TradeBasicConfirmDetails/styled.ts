import styled from 'styled-components/macro'

import { RateInfo } from 'common/pure/RateInfo'

export const Wrapper = styled.div`
  padding: 10px;
  font-size: 13px;
`

export const StyledRateInfo = styled(RateInfo)`
  margin: 0 auto;
  font-size: 13px;
`

export const ItemWithArrow = styled.div`
  display: flex;
  align-items: center;

  > svg:first-child {
    margin-right: 5px;
  }
`
