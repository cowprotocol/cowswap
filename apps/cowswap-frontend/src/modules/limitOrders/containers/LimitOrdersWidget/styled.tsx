import styled from 'styled-components/macro'

import { NumericalInput } from 'modules/limitOrders/containers/RateInput/styled'

import { RateInfo } from 'common/pure/RateInfo'

export const TradeButtonBox = styled.div`
  margin: 10px 0 0;
  display: flex;
  gap: 10px;
  flex-direction: column;
`

export const FooterBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  margin: 0 4px;
  padding: 0;
`

export const RateWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 151px;
  grid-template-rows: max-content;
  gap: 6px;
  text-align: right;
  color: inherit;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
  `}

  ${NumericalInput} {
    font-size: 21px;
  }
`

export const StyledRateInfo = styled(RateInfo)`
  padding-top: 8px;
  gap: 4px;
  font-size: 13px;
  min-height: 24px;
  display: grid;
  grid-template-columns: max-content auto;
  grid-template-rows: max-content;
`
