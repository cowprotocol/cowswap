import * as styledEl from './styled'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { FiatAmount } from '@cow/common/pure/FiatAmount'
import { ExecutionPrice } from '@cow/modules/limitOrders/pure/ExecutionPrice'
import { convertAmountToCurrency } from '@cow/modules/limitOrders/utils/calculateExecutionPrice'

export interface ExecutionPriceTooltipProps {
  isInversed: boolean
  feeAmount: CurrencyAmount<Currency> | null
  displayedRate: string | null
  executionPrice: Price<Currency, Currency> | null
  marketRate: Fraction | null
}

// TODO: change the tooltip (Mindy will give a text)
export const RateTooltipHeader = (
  <styledEl.Content>
    <h3>CoW Swap limit orders are gasless.</h3>
    <p>
      CoW Swap covers all the fees (including gas) by monitoring network conditions and filling your order when the
      market price is slightly better than your specified limit price. The extra tokens we get are used to cover your
      fees. Then we give any leftovers back to you!{' '}
      <a href="https://swap.cow.fi/" target="_blank" rel="noopener nofollow noreferrer">
        Learn more about limit orders.
      </a>
    </p>
  </styledEl.Content>
)

function formatFeeAmount({
  marketRate,
  feeAmount,
  isInversed,
  executionPrice,
}: ExecutionPriceTooltipProps): CurrencyAmount<Currency> | null {
  const currency = isInversed ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency
  const invertedFee = marketRate && feeAmount ? marketRate.multiply(feeAmount) : null

  return !isInversed && invertedFee && currency && feeAmount
    ? convertAmountToCurrency(
        CurrencyAmount.fromFractionalAmount(feeAmount.currency, invertedFee.numerator, invertedFee.denominator),
        currency
      )
    : feeAmount
}

export function ExecutionPriceTooltip(props: ExecutionPriceTooltipProps) {
  const { isInversed, displayedRate, executionPrice } = props

  const currentCurrency = isInversed ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency
  const formattedFeeAmount = formatFeeAmount(props)

  const feeUsdValue = useHigherUSDValue(formattedFeeAmount || undefined)

  return (
    <styledEl.FeeTooltipWrapper>
      {RateTooltipHeader}

      <styledEl.FeeItem borderTop>
        <span>
          <p>Limit price</p>
          <b>
            {displayedRate} {currentCurrency?.symbol}
          </b>
        </span>
      </styledEl.FeeItem>

      <styledEl.FeeItem>
        <i>Included in the estimated execution price</i>
        {formattedFeeAmount && (
          <span>
            <p>Current network fees</p>
            <span>
              <b>
                ≈ <TokenAmount amount={formattedFeeAmount} tokenSymbol={formattedFeeAmount?.currency} />
              </b>
              <br />
              {feeUsdValue && (
                <>
                  (<FiatAmount accurate={true} amount={feeUsdValue} />)
                </>
              )}
            </span>
          </span>
        )}
      </styledEl.FeeItem>

      <styledEl.FeeItem highlighted>
        <b>Order executes at</b>
        <span>
          <b>{executionPrice && <ExecutionPrice executionPrice={executionPrice} isInversed={isInversed} />}</b>
        </span>
      </styledEl.FeeItem>
    </styledEl.FeeTooltipWrapper>
  )
}
