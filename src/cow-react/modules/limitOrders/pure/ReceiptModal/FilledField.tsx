// Code based on https://github.com/cowprotocol/explorer/blob/develop/src/components/orders/FilledProgress/index.tsx
import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { BigNumber } from 'bignumber.js'
import JSBI from 'jsbi'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

interface Props {
  order: ParsedOrder
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
}

// TODO: using .toNumber() we potentially lose accuracy
// TODO: must be refactored with replacing bignumber.js by @ethersproject/bignumber
function legacyBigNumberToCurrencyAmount(currency: Token, value: BigNumber | undefined): CurrencyAmount<Token> {
  return CurrencyAmount.fromRawAmount(currency, Math.ceil((value?.toNumber() || 0) * 10 ** currency.decimals))
}

export function FilledField({ order, sellAmount, buyAmount }: Props) {
  const {
    inputToken,
    outputToken,
    filledPercentage,
    formattedPercentage,
    fullyFilled,
    kind,
    feeAmount,
    executedBuyAmount,
    executedSellAmount,
    executedFeeAmount,
    filledAmount,
  } = order

  const touched = !!filledPercentage?.gt(0)

  let mainToken: Token
  let mainAmount: CurrencyAmount<Token>
  let swappedToken: Token
  let swappedAmount: JSBI | undefined
  let action: string

  // TODO: set types, move calculations logic to a function
  let filledAmountWithFee, swappedAmountWithFee
  if (kind === OrderKind.SELL) {
    action = 'sold'

    mainToken = inputToken
    mainAmount = sellAmount.add(CurrencyAmount.fromRawAmount(mainToken, feeAmount.toString()))

    swappedToken = outputToken
    swappedAmount = executedBuyAmount

    // Sell orders, add the fee in to the sellAmount (mainAmount, in this case)
    filledAmountWithFee = filledAmount?.plus(executedFeeAmount || '0')
    swappedAmountWithFee = new BigNumber(swappedAmount?.toString() || '0')
  } else {
    action = 'bought'

    mainToken = outputToken
    mainAmount = buyAmount

    swappedToken = inputToken
    swappedAmount = executedSellAmount

    // Buy orders need to add the fee, to the sellToken too (swappedAmount in this case)
    filledAmountWithFee = filledAmount
    swappedAmountWithFee = new BigNumber(swappedAmount?.toString() || '0').plus(executedFeeAmount || '0')
  }

  // In case the token object is empty, display the raw amount (`decimals || 0` part)

  const filledAmountDecimal = filledAmountWithFee?.div(new BigNumber(10 ** mainToken.decimals))
  const formattedFilledAmount = legacyBigNumberToCurrencyAmount(mainToken, filledAmountDecimal)

  const swappedAmountDecimal = swappedAmountWithFee.div(new BigNumber(10 ** swappedToken.decimals))
  const formattedSwappedAmount = legacyBigNumberToCurrencyAmount(outputToken, swappedAmountDecimal)

  return (
    <styledEl.Value>
      <styledEl.InlineWrapper>
        <styledEl.Progress active={formattedPercentage || 0} />
      </styledEl.InlineWrapper>

      <styledEl.InlineWrapper>
        <span>
          <b>
            {/* Executed part (bought/sold tokens) */}
            <TokenAmount amount={formattedFilledAmount} tokenSymbol={formattedFilledAmount.currency} />
          </b>{' '}
          {!fullyFilled && (
            // Show the total amount to buy/sell. Only for orders that are not 100% executed
            <>
              of{' '}
              <b>
                <TokenAmount amount={mainAmount} tokenSymbol={mainAmount?.currency} />
              </b>{' '}
            </>
          )}
          {action}{' '}
          {touched && (
            // Executed part of the trade:
            //    Total buy tokens you receive (for sell orders)
            //    Total sell tokens you pay (for buy orders)
            <>
              for a total of{' '}
              <b>
                <TokenAmount amount={formattedSwappedAmount} tokenSymbol={formattedSwappedAmount.currency} />
              </b>
            </>
          )}
        </span>
      </styledEl.InlineWrapper>
    </styledEl.Value>
  )
}
