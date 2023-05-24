import { shortenOrderId } from '../../utils'
import { CancellationSummary } from 'modules/account/containers/Transaction/styled'
import styled from 'styled-components/macro'

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
