import { CurrencyAmount, Trade, Currency, JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { FeeInformation } from 'custom/utils/operator'
import { getFeeAmount } from '@src/custom/utils/fee'

interface ExtendedTradeParams {
  exactInTrade?: Trade | null
  exactOutTrade?: Trade | null
  typedAmountAsCurrency?: CurrencyAmount
  feeAsCurrency?: CurrencyAmount
}

/**
 * extendExactInTrade
 * @description takes a Uni ExactIn Trade object and returns a custom one with fee adjusted inputAmount
 */
export function extendExactInTrade(params: Pick<ExtendedTradeParams, 'exactInTrade' | 'typedAmountAsCurrency'>) {
  const { exactInTrade, typedAmountAsCurrency } = params

  if (!exactInTrade || !typedAmountAsCurrency) return null

  // We need to iverride the Trade object to use different values as we are intercepting initial inputs
  // and applying fee. For ExactIn orders, we leave outputAmount as is
  // and only change inputAmount to show the original entry before fee calculation
  return {
    ...exactInTrade,
    inputAmount: typedAmountAsCurrency,
    inputAmountWithFees: exactInTrade.inputAmount,
    minimumAmountOut: exactInTrade.minimumAmountOut,
    maximumAmountIn: exactInTrade.maximumAmountIn
  }
}

/**
 * extendExactOutTrade
 * @description takes a Uni ExactOut Trade object and returns a custom one with fee adjusted inputAmount
 */
export function extendExactOutTrade(params: Pick<ExtendedTradeParams, 'exactOutTrade' | 'feeAsCurrency'>) {
  const { exactOutTrade, feeAsCurrency } = params

  if (!exactOutTrade || !feeAsCurrency) return null

  const inputAmountWithFee = exactOutTrade.inputAmount.add(feeAsCurrency)
  // We need to override the Trade object to use different values as we are intercepting initial inputs
  // and applying fee. For ExactOut orders, we leave inputAmount as is
  // and only change outputAm to show the original entry before fee calculation
  return {
    ...exactOutTrade,
    inputAmount: inputAmountWithFee,
    minimumAmountOut: exactOutTrade.minimumAmountOut,
    maximumAmountIn: exactOutTrade.maximumAmountIn
  }
}

interface TradeParams {
  parsedAmount?: CurrencyAmount
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  feeInformation?: Omit<FeeInformation, 'expirationDate'>
}

const stringToCurrency = (amount: string, currency: Currency) =>
  currency instanceof Token ? new TokenAmount(currency, JSBI.BigInt(amount)) : CurrencyAmount.ether(JSBI.BigInt(amount))

/**
 * useTradeExactInWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactInWithFee({
  parsedAmount,
  outputCurrency,
  feeInformation
}: Omit<TradeParams, 'inputCurrency'>) {
  let feeAdjustedAmount: CurrencyAmount | undefined
  // make sure we have a typed in amount
  // else we can assume the trade will be null
  // and we call `useTradeExacIn` with an `undefined` which returns null trade
  if (parsedAmount && feeInformation) {
    // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
    const unformattedFee = getFeeAmount({
      sellAmount: parsedAmount.raw.toString(),
      ...feeInformation
    })

    const fee = stringToCurrency(unformattedFee, parsedAmount.currency)
    // Check that fee amount is not greater than the user's input amt
    const validFee = fee.lessThan(parsedAmount)
    // If the fee value is higher than we are inputting, return undefined
    // this makes sure `useTradeExactIn` returns null === no trade
    feeAdjustedAmount = validFee ? parsedAmount.subtract(fee) : undefined
  }

  // Original Uni trade hook
  const inTrade = useTradeExactIn(feeAdjustedAmount, outputCurrency ?? undefined)

  return extendExactInTrade({
    exactInTrade: inTrade,
    typedAmountAsCurrency: parsedAmount
  })
}

/**
 * useTradeExactOutWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactOutWithFee({
  parsedAmount,
  inputCurrency,
  feeInformation
}: Omit<TradeParams, 'outputCurrency'>) {
  // Original Uni trade hook
  const outTrade = useTradeExactOut(inputCurrency ?? undefined, parsedAmount)

  // We need to determine the fee after, as the parsedAmount isn't known beforehand
  // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
  let fee: CurrencyAmount | undefined
  if (outTrade?.inputAmount && feeInformation) {
    const unformattedFee = getFeeAmount({
      sellAmount: outTrade.inputAmount.raw.toString(),
      ...feeInformation
    })

    fee = stringToCurrency(unformattedFee, outTrade.inputAmount.currency)
  }

  return extendExactOutTrade({
    exactOutTrade: outTrade,
    feeAsCurrency: fee
  })
}
