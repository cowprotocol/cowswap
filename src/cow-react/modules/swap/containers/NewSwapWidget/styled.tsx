import styled from 'styled-components/macro'
import SwapHeader from 'components/swap/SwapHeader'
import { RemoveRecipient } from '@cow/modules/swap/containers/RemoveRecipient'
import { LoadingWrapper } from '@cow/common/pure/CurrencyArrowSeparator/styled'

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
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 12px 4px;
  margin: 5px 0 15px 0;
  font-weight: 500;
  font-size: 16px;
`

export const SwapFormWrapper = styled.div`
  margin: 0 0 10px;

  ${LoadingWrapper} {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      --size: 24px;
      height: var(--size);
      width: var(--size);
      left: calc(50% - var(--size)/2);
      border-radius: var(--size);
  `};
  }
`

export const CurrencySeparatorBox = styled.div<{ withRecipient: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: ${({ withRecipient }) => (withRecipient ? '10px' : '1px 0')};
`

export const SwapHeaderStyled = styled(SwapHeader)`
  padding: 8px 8px 16px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0 0 16px;
  `};
`

export const RemoveRecipientStyled = styled(RemoveRecipient)`
  margin: 10px 0;
`
