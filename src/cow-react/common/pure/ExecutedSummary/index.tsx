import { getExecutedSummaryData } from '@cow/utils/getExecutedSummaryData'
import { Order } from 'state/orders/actions'
import { useCoingeckoUsdValue } from 'hooks/useStablecoinPrice'
import * as styledEl from './styled'
import { MIN_FIAT_SURPLUS_VALUE } from 'constants/index'

export function ExecutedSummary({ order }: { order: Order }) {
  const { formattedFilledAmount, formattedSwappedAmount, surplusAmount, surplusToken } = getExecutedSummaryData(order)

  const fiatValue = useCoingeckoUsdValue(surplusAmount)
  // I think its fine here to use Number because its always USD value
  const showFiatValue = Number(fiatValue?.toExact()) > MIN_FIAT_SURPLUS_VALUE

  return (
    <styledEl.SummaryWrapper>
      <div>
        Traded{' '}
        <styledEl.StyledTokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} /> for a
        total of{' '}
        <styledEl.StyledTokenAmount amount={formattedSwappedAmount} tokenSymbol={formattedSwappedAmount.currency} />
      </div>

      {!!surplusAmount && (
        <styledEl.SurplusWrapper>
          <span>Order surplus: </span>

          <styledEl.SurplusAmount>
            <styledEl.StyledTokenAmount amount={surplusAmount} tokenSymbol={surplusToken} />
            {showFiatValue && (
              <styledEl.FiatWrapper>
                (<styledEl.StyledFiatAmount amount={fiatValue} />)
              </styledEl.FiatWrapper>
            )}
          </styledEl.SurplusAmount>
        </styledEl.SurplusWrapper>
      )}
    </styledEl.SummaryWrapper>
  )
}
