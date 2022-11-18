import styled from 'styled-components/macro'
import SwapHeader from 'components/swap/SwapHeader'
import { RemoveRecipient } from '@cow/modules/swap/containers/RemoveRecipient'

export const Container = styled.div`
  max-width: ${({ theme }) => theme.appBody.maxWidth.swap};
  width: 100%;
`

export const ContainerBox = styled.div`
  background: ${({ theme }) => theme.bg1};
  border: none;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.swap};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 10px 16px 16px;
  `};
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 12px 4px;
  margin: 5px 0 15px 0;

  font-weight: 500;
  font-size: 16px;
`

export const CurrencySeparatorBox = styled.div<{ withRecipient: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: ${({ withRecipient }) => (withRecipient ? '10px' : '0')};
`

export const SwapHeaderStyled = styled(SwapHeader)`
  padding: 0 0.25rem 0.5rem 0.25rem;
`

export const RemoveRecipientStyled = styled(RemoveRecipient)`
  margin: 10px 0;
`
