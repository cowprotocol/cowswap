import { FiatAmount, TokenAmount } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ExecutedWrapper = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  > img {
    max-width: 100%;
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
    gap: 16px;
    font-size: 15px;

    > a {
      text-decoration: underline;
      display: block;
      margin: 0;
    }
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
