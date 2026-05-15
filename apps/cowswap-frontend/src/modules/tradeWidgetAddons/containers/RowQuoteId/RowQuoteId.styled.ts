import styled from 'styled-components/macro'

import { TransactionText } from '../../pure/Row/styled'

export const QuoteIdValueWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  line-height: 1;
`

export const QuoteIdReference = styled.span`
  white-space: nowrap;
`

export const QuoteIdTransactionText = styled(TransactionText)`
  align-items: center;
`
