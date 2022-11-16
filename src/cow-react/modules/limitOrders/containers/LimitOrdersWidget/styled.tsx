import styled from 'styled-components/macro'
import { RemoveRecipient } from '@cow/modules/swap/containers/RemoveRecipient'
import { RateInfo } from '@cow/modules/limitOrders/pure/RateInfo'

export const Container = styled.div`
  width: 100%;
`

export const ContainerBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  background: ${({ theme }) => theme.bg1};
  border: none;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.trade};

  /* ${({ theme }) => theme.mediaWidth.upToSmall`
  `}; */
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px;
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
  margin: 0;
`

export const RateWrapper = styled.div`
  display: flex;
  gap: 10px;
`

export const StyledRemoveRecipient = styled(RemoveRecipient)`
  margin: 15px 0;
`

export const StyledRateInfo = styled(RateInfo)`
  margin-top: 15px;
`
