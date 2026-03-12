import { LinkStyledButton, UI } from '@cowprotocol/ui'

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

export const CopyQuoteIdButton = styled(LinkStyledButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0;
  line-height: 0;
  opacity: 0.8;

  &:hover,
  &:focus {
    text-decoration: none;
    opacity: 1;
  }
`

export const CopiedLabel = styled.span`
  color: var(${UI.COLOR_SUCCESS});
  font-size: 11px;
  line-height: 1;
`
