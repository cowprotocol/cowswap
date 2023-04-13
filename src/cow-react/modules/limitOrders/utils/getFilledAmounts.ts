import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { BigNumber } from 'bignumber.js'
import JSBI from 'jsbi'

// TODO: using .toNumber() we potentially lose accuracy
// TODO: if we do migrations to etherjs v6, we should use native ES6 bignumber
function legacyBigNumberToCurrencyAmount(currency: Token, value: BigNumber | undefined): CurrencyAmount<Token> {
  return CurrencyAmount.fromRawAmount(currency, Math.ceil((value?.toNumber() || 0) * 10 ** currency.decimals))
}

export function getFilledAmounts(order: ParsedOrder) {
  const {
    inputToken,
    outputToken,
    kind,
    feeAmount,
    executedBuyAmount,
    executedSellAmount,
    executedFeeAmount,
    filledAmount,
    sellAmount,
    buyAmount,
  } = order

  let mainToken: Token
  let mainAmount: CurrencyAmount<Token>
  let swappedToken: Token
  let swappedAmount: JSBI | undefined
  let action: string

  const sellAmountCurrency = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString())
  const buyAmountCurrency = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())

  // TODO: set types, move calculations logic to a function
  let filledAmountWithFee, swappedAmountWithFee
  if (kind === OrderKind.SELL) {
    action = 'sold'

    mainToken = inputToken
    mainAmount = sellAmountCurrency.add(CurrencyAmount.fromRawAmount(mainToken, feeAmount.toString()))

    swappedToken = outputToken
    swappedAmount = executedBuyAmount

    // Sell orders, add the fee in to the sellAmount (mainAmount, in this case)
    filledAmountWithFee = filledAmount?.plus(executedFeeAmount || '0')
    swappedAmountWithFee = new BigNumber(swappedAmount?.toString() || '0')
  } else {
    action = 'bought'

    mainToken = outputToken
    mainAmount = buyAmountCurrency

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
  const formattedSwappedAmount = legacyBigNumberToCurrencyAmount(swappedToken, swappedAmountDecimal)

  return {
    formattedFilledAmount,
    formattedSwappedAmount,
    mainAmount,
    action,
  }
}
