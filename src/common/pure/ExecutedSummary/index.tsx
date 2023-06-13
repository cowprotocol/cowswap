import { useGetSurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export function ExecutedSummary({ order }: { order: ParsedOrder }) {
  const { formattedFilledAmount, formattedSwappedAmount } = getExecutedSummaryData(order)
  const { surplusFiatValue, showFiatValue, surplusToken, surplusAmount } = useGetSurplusData(order)

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
                (<styledEl.StyledFiatAmount amount={surplusFiatValue} />)
              </styledEl.FiatWrapper>
            )}
          </styledEl.SurplusAmount>
        </styledEl.SurplusWrapper>
      )}
    </styledEl.SummaryWrapper>
  )
}
