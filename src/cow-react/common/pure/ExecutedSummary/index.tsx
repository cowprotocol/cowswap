import { getExecutedSummaryData } from '@cow/utils/getExecutedSummaryData'
import { Order } from '@src/custom/state/orders/actions'
import { useHigherUSDValue } from '@src/custom/hooks/useStablecoinPrice'
import * as styledEl from './styled'

const MIN_FIAT_VALUE = 0.01

export function ExecutedSummary({ order }: { order: Order }) {
  const { formattedFilledAmount, formattedSwappedAmount, surplusAmount, surplusToken } = getExecutedSummaryData(order)

  const fiatValue = useHigherUSDValue(surplusAmount)
  // I think its fine here to use Number because its always USD value
  const showFiatValue = Number(fiatValue?.toExact()) > MIN_FIAT_VALUE

  return (
    <styledEl.SummaryWrapper>
      <div>
        Traded{' '}
        <styledEl.StyledTokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} /> for a
        total of{' '}
        <styledEl.StyledTokenAmount amount={formattedSwappedAmount} tokenSymbol={formattedSwappedAmount.currency} />
      </div>

      {!!surplusAmount && (
        <div>
          <span>Order surplus: </span>

          <styledEl.SurplusAmount>
            <styledEl.StyledTokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
            {showFiatValue && <styledEl.StyledFiatAmount amount={fiatValue} />}
          </styledEl.SurplusAmount>
        </div>
      )}
    </styledEl.SummaryWrapper>
  )
}
