import { shortenOrderId } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg1};
`
// Moved this function to separate file to avoid curcular deps

const Wrapper = styled.div`
  & > p:first-child {
    margin-top: 0;
  }

  & > p:last-child {
    margin-bottom: 0;
  }
`

export function buildCancellationPopupSummary(id: string, summary: string | undefined): JSX.Element {
  return (
    <Wrapper>
      <p>Order successfully cancelled</p>
      <p>
        Order <strong>{shortenOrderId(id)}</strong>:
      </p>
      <CancellationSummary as="p">{summary}</CancellationSummary>
    </Wrapper>
  )
}
