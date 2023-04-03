import styled from 'styled-components/macro'
import { SetRecipient } from '@cow/modules/swap/containers/SetRecipient'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { NumericalInput } from '@cow/modules/limitOrders/containers/RateInput/styled'
import { transparentize, darken } from 'polished'
import { OrderType } from '@cow/modules/limitOrders/pure/OrderType'

export const Container = styled.div`
  width: 100%;
`

export const ContainerBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 6px;
  background: ${({ theme }) => theme.bg1};
  border: none;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 4px 10px 8px;
  margin: 0;
  font-weight: 500;
  font-size: 16px;
`

export const CurrencySeparatorBox = styled.div<{ withRecipient: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: ${({ withRecipient }) => (withRecipient ? '0 10px' : '0')};
`

export const SettingsButton = styled.div`
  display: flex;
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
`

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
  grid-template-columns: auto 150px;
  gap: 6px;
  text-align: right;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
  `}

  ${NumericalInput} {
    font-size: 21px;
  }
`

export const StyledRemoveRecipient = styled(SetRecipient)`
  margin: 15px 0;
`

export const StyledRateInfo = styled(RateInfo)`
  padding-top: 8px;
  gap: 4px;
  font-size: 13px;
  min-height: 24px;
  display: grid;
  grid-template-columns: max-content auto;
`

export const StyledOrderType = styled(OrderType)`
  font-size: 13px;
`

export const SmallVolumeWarningBanner = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => (theme.darkMode ? transparentize(0.9, theme.alert) : transparentize(0.85, theme.alert))};
  color: ${({ theme }) => darken(theme.darkMode ? 0 : 0.15, theme.alert)};
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
