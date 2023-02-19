import * as styledEl from './styled'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { FiatAmount } from '@cow/common/pure/FiatAmount'
import { ExecutionPrice } from '@cow/modules/limitOrders/pure/ExecutionPrice'

export interface ExecutionPriceTooltipProps {
  isInversed: boolean
  feeAmount: CurrencyAmount<Currency> | null
  displayedRate: string | null
  executionPrice: Price<Currency, Currency> | null
}

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

export function ExecutionPriceTooltip(props: ExecutionPriceTooltipProps) {
  const { isInversed, feeAmount, displayedRate, executionPrice } = props

  const feeUsdValue = useHigherUSDValue(feeAmount || undefined)

  return (
    <styledEl.FeeTooltipWrapper>
      {RateTooltipHeader}

      <styledEl.FeeItem borderTop>
        <span>
          <p>Limit price</p>
          <b>
            {displayedRate} {isInversed ? executionPrice?.baseCurrency.symbol : executionPrice?.quoteCurrency.symbol}
          </b>
        </span>
      </styledEl.FeeItem>

      <styledEl.FeeItem>
        <i>Included in the estimated execution price</i>
        {feeAmount && (
          <span>
            <p>Current network fees</p>
            <span>
              <b>
                ≈ <TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} />
              </b>
              <br />
              (<FiatAmount accurate={true} amount={feeUsdValue} />)
            </span>
          </span>
        )}
      </styledEl.FeeItem>

      <styledEl.FeeItem highlighted>
        {/* <i>Order will execute at</i> */}
        <span>
          <p>Est. execution price</p>
          <b>{executionPrice && <ExecutionPrice executionPrice={executionPrice} isInversed={isInversed} />}</b>
        </span>
      </styledEl.FeeItem>
    </styledEl.FeeTooltipWrapper>
  )
}
