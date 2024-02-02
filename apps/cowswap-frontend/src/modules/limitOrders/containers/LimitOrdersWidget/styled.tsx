import { darken, transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { NumericalInput } from 'modules/limitOrders/containers/RateInput/styled'
import { OrderType } from 'modules/limitOrders/pure/OrderType'

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

export const StyledOrderType = styled(OrderType)`
  font-size: 13px;
`

export const SmallVolumeWarningBanner = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => (theme.darkMode ? transparentize(theme.alert, 0.9) : transparentize(theme.alert, 0.85))};
  color: ${({ theme }) => darken(theme.alert, theme.darkMode ? 0 : 0.15)};
  gap: 10px;
  border-radius: 10px;
  margin: 8px auto 0;
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;

  > svg {
    display: block;
    width: 34px;
    height: 21px;
  }

  > svg > path {
    fill: ${({ theme }) => theme.alert};
  }
`
