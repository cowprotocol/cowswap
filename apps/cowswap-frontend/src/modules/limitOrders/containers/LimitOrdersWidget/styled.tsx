import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { NumericalInput } from 'modules/limitOrders/containers/RateInput/styled'

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

  ${Media.upToSmall()} {
    display: flex;
    flex-flow: column wrap;
  }

  ${NumericalInput} {
    font-size: 21px;
  }
`
