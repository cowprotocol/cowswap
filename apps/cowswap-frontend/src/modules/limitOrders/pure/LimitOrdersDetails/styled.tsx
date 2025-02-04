import styled from 'styled-components/macro'

import { RateInfo } from 'common/pure/RateInfo'

export const DetailsRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: right;
  gap: 16px;

  p {
    opacity: 0.8;
    padding: 0;
    margin: 0;
    text-align: left;
    white-space: nowrap;
  }
`

export const StyledRateInfo = styled(RateInfo).attrs({ rightAlign: true })`
  font-size: 13px;
  font-weight: 400;
  color: inherit;
  gap: 16px;
`
