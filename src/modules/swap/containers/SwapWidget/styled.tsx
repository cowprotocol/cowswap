import styled from 'styled-components/macro'
import SwapHeader from 'legacy/components/swap/SwapHeader'
import { SetRecipient } from 'modules/swap/containers/SetRecipient'
import { LoadingWrapper } from 'common/pure/CurrencyArrowSeparator/styled'

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
  padding: 4px 4px 16px 8px;
`

export const SetRecipientStyled = styled(SetRecipient)`
  margin: 10px 0;
`
