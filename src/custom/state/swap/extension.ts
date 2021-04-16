import { CurrencyAmount, Trade, Currency, JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { EMPTY_FEE, FeeInformation } from 'state/fee/reducer'

export type FeeForTrade = { feeAsCurrency: CurrencyAmount | undefined } & Pick<FeeInformation, 'amount'>

export type TradeWithFee = Trade & {
  inputAmountWithFee: CurrencyAmount
  outputAmountWithoutFee?: CurrencyAmount
  fee?: FeeForTrade
}

type ExtendedTradeParams = {
  exactInTrade?: Trade | null
  exactOutTrade?: Trade | null
  originalTrade?: Trade | null
  typedAmountAsCurrency?: CurrencyAmount
  fee: FeeForTrade
}

/**
 * extendExactInTrade
 * @description takes a Uni ExactIn Trade object and returns a custom one with fee adjusted inputAmount
 */
export function extendExactInTrade(params: Omit<ExtendedTradeParams, 'exactOutTrade'>): TradeWithFee | null {
  const { exactInTrade, typedAmountAsCurrency, fee, originalTrade } = params

  if (!exactInTrade || !typedAmountAsCurrency) return null

  // We need to override the Trade object to use different values as we are intercepting initial inputs
  // and applying fee. For ExactIn orders, we leave outputAmount as is
  // and only change inputAmount to show the original entry before fee calculation
  return {
    ...exactInTrade,
    // overriding inputAmount is a hack
    // to allow us to not have to change Uni's pages/swap/index and use different method names
    inputAmount: typedAmountAsCurrency,
    inputAmountWithFee: exactInTrade.inputAmount,
    outputAmountWithoutFee: originalTrade?.outputAmount,
    minimumAmountOut: exactInTrade.minimumAmountOut,
    maximumAmountIn: exactInTrade.maximumAmountIn,
    fee
  }
}

/**
 * extendExactOutTrade
 * @description takes a Uni ExactOut Trade object and returns a custom one with fee adjusted inputAmount
 */
export function extendExactOutTrade(params: Omit<ExtendedTradeParams, 'exactInTrade'>): TradeWithFee | null {
  const { exactOutTrade, fee } = params

  if (!exactOutTrade || !fee.feeAsCurrency) return null

  const inputAmountWithFee = exactOutTrade.inputAmount.add(fee.feeAsCurrency)
  // We need to override the Trade object to use different values as we are intercepting initial inputs
  // and applying fee. For ExactOut orders, we leave inputAmount as is
  // and only change outputAm to show the original entry before fee calculation
  return {
    ...exactOutTrade,
    // overriding inputAmount is a hack
    // to allow us to not have to change Uni's pages/swap/index and use different method names
    inputAmount: inputAmountWithFee,
    inputAmountWithFee,
    minimumAmountOut: exactOutTrade.minimumAmountOut,
    maximumAmountIn: exactOutTrade.maximumAmountIn,
    fee
  }
}

interface TradeParams {
  parsedAmount?: CurrencyAmount
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  feeInformation?: Omit<FeeInformation, 'expirationDate'>
}

export const stringToCurrency = (amount: string, currency: Currency) =>
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
  let fee: FeeForTrade = { ...EMPTY_FEE, ...feeInformation }
  // make sure we have a typed in amount
  // else we can assume the trade will be null
  // and we call `useTradeExacIn` with an `undefined` which returns null trade
  if (parsedAmount && feeInformation) {
    // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
    const { amount: feeAsString } = feeInformation

    const feeAsCurrency = stringToCurrency(feeAsString, parsedAmount.currency)
    // Check that fee amount is not greater than the user's input amt
    const isValidFee = feeAsCurrency.lessThan(parsedAmount)
    // If the feeAsCurrency value is higher than we are inputting, return undefined
    // this makes sure `useTradeExactIn` returns null === no trade
    feeAdjustedAmount = isValidFee ? parsedAmount.subtract(feeAsCurrency) : undefined

    // set final fee object
    fee = {
      ...feeInformation,
      feeAsCurrency
    }
  }

  // Original Uni trade hook
  const inTrade = useTradeExactIn(feeAdjustedAmount, outputCurrency ?? undefined)
  const originalTrade = useTradeExactIn(parsedAmount, outputCurrency ?? undefined)

  return extendExactInTrade({
    exactInTrade: inTrade,
    originalTrade,
    typedAmountAsCurrency: parsedAmount,
    fee
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
  let fee: FeeForTrade = { ...EMPTY_FEE, ...feeInformation }
  if (outTrade?.inputAmount && feeInformation) {
    const { amount: feeAsString } = feeInformation

    const feeAsCurrency = stringToCurrency(feeAsString, outTrade.inputAmount.currency)

    // set final fee object
    fee = {
      ...feeInformation,
      feeAsCurrency
    }
  }

  return extendExactOutTrade({
    exactOutTrade: outTrade,
    fee
  })
}
