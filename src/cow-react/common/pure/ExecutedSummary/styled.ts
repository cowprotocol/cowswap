import styled from 'styled-components/macro'

import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { FiatAmount } from '../FiatAmount'

export const SummaryWrapper = styled.div`
  font-size: 1rem;

  > div {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0.6rem;
    }
  }
`

export const StyledTokenAmount = styled(TokenAmount)`
  font-size: 0.9rem;
  white-space: nowrap;
  font-weight: 600;
`

export const StyledFiatAmount = styled(FiatAmount)`
  font-size: 12px;
  margin-left: 5px;
`

export const SurplusAmount = styled.div`
  white-space: nowrap;
`
