import styled from 'styled-components/macro'

import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { getExecutedSummaryData } from '@cow/utils/getExecutedSummaryData'
import { Order } from '@src/custom/state/orders/actions'

const SummaryWrapper = styled.div`
  font-size: 1rem;

  > div {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0.6rem;
    }
  }
`

const Strong = styled.strong`
  font-size: 0.9rem;
  white-space: nowrap;
`

export function getExecutedSummary(order: Order): JSX.Element | string | null {
  if (!order) return null

  const { formattedFilledAmount, formattedSwappedAmount, surplusAmount, surplusToken } = getExecutedSummaryData(order)

  return (
    <SummaryWrapper>
      <div>
        Traded{' '}
        <Strong>
          <TokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} />
        </Strong>{' '}
        for a total of{' '}
        <Strong>
          <TokenAmount amount={formattedSwappedAmount} tokenSymbol={formattedSwappedAmount.currency} />
        </Strong>
      </div>

      {!!surplusAmount && (
        <div>
          <span>Order surplus: </span>
          <Strong>
            <TokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
          </Strong>
        </div>
      )}
    </SummaryWrapper>
  )
}
