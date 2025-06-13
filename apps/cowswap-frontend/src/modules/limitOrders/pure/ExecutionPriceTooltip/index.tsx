import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { ExecutionPrice } from 'common/pure/ExecutionPrice'
import { convertAmountToCurrency } from 'utils/orderUtils/calculateExecutionPrice'

import * as styledEl from './styled'

export interface ExecutionPriceTooltipProps {
  isInverted: boolean
  feeAmount: CurrencyAmount<Currency> | null
  displayedRate: string | null
  executionPrice: Price<Currency, Currency> | null
  marketRate: Fraction | null
  isOpenOrdersTab?: boolean
}

function formatFeeAmount({
  marketRate,
  feeAmount,
  isInverted,
  executionPrice,
}: ExecutionPriceTooltipProps): CurrencyAmount<Currency> | null {
  const currency = isInverted ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency
  const invertedFee = marketRate && feeAmount ? marketRate.multiply(feeAmount) : null

  return !isInverted && invertedFee && currency && feeAmount
    ? convertAmountToCurrency(
        CurrencyAmount.fromFractionalAmount(feeAmount.currency, invertedFee.numerator, invertedFee.denominator),
        currency,
      )
    : feeAmount
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ExecutionPriceTooltip(props: ExecutionPriceTooltipProps) {
  const { isInverted, displayedRate, executionPrice } = props

  const currentCurrency = isInverted ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency
  const formattedFeeAmount = formatFeeAmount(props)

  const feeUsdValue = useUsdAmount(formattedFeeAmount || undefined).value

  return (
    <styledEl.FeeTooltipWrapper>
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
          <b>{executionPrice && <ExecutionPrice executionPrice={executionPrice} isInverted={isInverted} />}</b>
        </span>
      </styledEl.FeeItem>
    </styledEl.FeeTooltipWrapper>
  )
}
