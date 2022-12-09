import styled from 'styled-components/macro'
import { RateInfo } from '@cow/common/pure/RateInfo'

export const DetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: right;
`

export const StyledRateInfo = styled(RateInfo)`
  margin-bottom: 5px;
  font-size: 14px;
`
