import styled from 'styled-components/macro'
import { RemoveRecipient } from '@cow/modules/swap/containers/RemoveRecipient'
import { RateInfo } from '@cow/common/pure/RateInfo'
import { NumericalInput } from '@cow/modules/limitOrders/containers/RateInput/styled'
import { DropdownBox } from '@cow/common/pure/Dropdown/styled'

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
  gap: 10px;
  display: flex;
  flex-flow: column wrap;
  margin: 10px 0 0;
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

  ${DropdownBox} {
    width: 100%;
  }
`

export const StyledRemoveRecipient = styled(RemoveRecipient)`
  margin: 15px 0;
`

export const StyledRateInfo = styled(RateInfo)`
  margin-top: 15px;
  font-size: 14px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
    padding: 8px;
    margin: 0;
    gap: 4px;
  `}
`
