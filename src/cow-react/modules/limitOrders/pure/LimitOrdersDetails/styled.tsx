import styled from 'styled-components/macro'
import { RateInfo } from '@cow/modules/limitOrders/pure/RateInfo'

export const DetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: right;
`

export const StyledRateInfo = styled(RateInfo)`
  margin-bottom: 5px;
`
