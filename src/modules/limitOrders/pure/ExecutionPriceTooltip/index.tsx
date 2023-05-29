import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'

import { ExecutionPrice } from 'modules/limitOrders/pure/ExecutionPrice'
import { ExecuteIndicator } from 'modules/limitOrders/pure/Orders/OrderRow/styled'
import { convertAmountToCurrency } from 'modules/limitOrders/utils/calculateExecutionPrice'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'

import * as styledEl from './styled'

export interface ExecutionPriceTooltipProps {
  isInverted: boolean
  feeAmount: CurrencyAmount<Currency> | null
  displayedRate: string | null
  executionPrice: Price<Currency, Currency> | null
  marketRate: Fraction | null
  isOpenOrdersTab?: boolean
}

export function OrderExecutionStatusList() {
  return (
    <styledEl.StatusList>
      <li>
        <ExecuteIndicator status={'veryClose'} /> <b>Very close</b> (&lt;0.5% from market price)
      </li>
      <li>
        <ExecuteIndicator status={'close'} /> <b>Close</b> (0.5% - 5% from market price)
      </li>
      <li>
        <ExecuteIndicator status={'notClose'} /> <b>Not yet close</b> (&gt;5% from market price)
      </li>
    </styledEl.StatusList>
  )
}

interface RateTooltipHeaderProps {
  isOpenOrdersTab?: boolean
}

export function RateTooltipHeader({ isOpenOrdersTab }: RateTooltipHeaderProps) {
  return (
    <styledEl.Content>
      <p>Fees (incl. gas) are covered by filling your order when the market price is better than your limit price.</p>

      {isOpenOrdersTab && (
        <>
          <h3>How close is my order to executing?</h3>
          {OrderExecutionStatusList()}
        </>
      )}
    </styledEl.Content>
  )
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
        currency
      )
    : feeAmount
}

export function ExecutionPriceTooltip(props: ExecutionPriceTooltipProps) {
  const { isInverted, displayedRate, executionPrice, isOpenOrdersTab } = props

  const currentCurrency = isInverted ? executionPrice?.baseCurrency : executionPrice?.quoteCurrency
  const formattedFeeAmount = formatFeeAmount(props)

  const feeUsdValue = useHigherUSDValue(formattedFeeAmount || undefined)

  return (
    <styledEl.FeeTooltipWrapper>
      <RateTooltipHeader isOpenOrdersTab={isOpenOrdersTab} />

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
