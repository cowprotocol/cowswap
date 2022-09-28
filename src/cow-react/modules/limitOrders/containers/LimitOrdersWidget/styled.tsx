import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'
import { Settings } from 'react-feather'
import { RemoveRecipient } from 'cow-react/modules/swap/containers/RemoveRecipient'

export const Container = styled.div`
  max-width: 460px;
  width: 100%;
`

export const ContainerBox = styled.div`
  padding: 12px 10px;
  border: 3px solid ${({ theme }) => theme.black};
  border-radius: 16px;
  box-shadow: 4px 4px 0 ${({ theme }) => theme.black};
  background: ${({ theme }) => theme.bg1};

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    box-shadow: none;
    border: 0;
  }
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

export const SettingsTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  margin-right: 5px;
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
