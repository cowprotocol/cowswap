import styled from 'styled-components/macro'
import { Settings } from 'react-feather'
import { RemoveRecipient } from '@cow/modules/swap/containers/RemoveRecipient'

export const Container = styled.div`
  max-width: ${({ theme }) => theme.appBody.maxWidth.trade};
  width: 100%;
`

export const ContainerBox = styled.div`
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
  padding: 0 4px;
  margin: 5px 0 15px 0;

  font-weight: 500;
  font-size: 16px;
`

export const CurrencySeparatorBox = styled.div<{ withRecipient: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: ${({ withRecipient }) => (withRecipient ? '10px' : '0')};
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
  margin-top: 15px;
`

export const SettingsIcon = styled(Settings)`
  height: 20px;
  width: 20px;
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

export const StyledRemoveRecipient = styled(RemoveRecipient)`
  margin: 15px 0;
`
