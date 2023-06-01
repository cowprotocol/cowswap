import styled from 'styled-components/macro'

import { RateInfo } from 'common/pure/RateInfo'

export const Wrapper = styled.div`
  padding: 1rem 0;
`

export const StyledRateInfo = styled(RateInfo)`
  font-size: 13px;
  font-weight: 500;
  margin: 0 auto;
`

export const ItemWithArrow = styled.div`
  display: flex;
  align-items: center;

  > svg:first-child {
    margin-right: 5px;
  }
`
