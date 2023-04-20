import styled from 'styled-components/macro'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { FiatAmount } from '@cow/common/pure/FiatAmount'

export const ExecutedWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 1rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 0.8rem;
  `};

  img {
    padding: 1rem;
    margin-right: 10px;

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      padding: 0;
      max-width: 60px;
    `};
  }

  a {
    margin: 0;
    margin-top: 15px;
    display: block;
  }

  > div > div {
    margin-bottom: 5px;
  }
`

export const StyledTokenAmount = styled(TokenAmount)`
  font-size: 0.9rem;
  white-space: nowrap;
  font-weight: 600;
`

export const StyledFiatAmount = styled(FiatAmount)`
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
`
