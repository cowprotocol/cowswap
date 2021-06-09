import { CanonicalMarketParams, getCanonicalMarket } from 'utils/misc'
import {
  CurrencyAmount,
  Trade,
  Currency,
  JSBI,
  Token,
  TokenAmount,
  Price,
  Percent,
  TradeType,
  Fraction
} from '@uniswap/sdk'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { FeeInformation, PriceInformation, QuoteInformationObject } from 'state/price/reducer'

export type FeeForTrade = { feeAsCurrency: CurrencyAmount } & Pick<FeeInformation, 'amount'>

export type TradeWithFee = Trade & {
  inputAmountWithFee: CurrencyAmount
  outputAmountWithoutFee?: CurrencyAmount
  fee: FeeForTrade
}

type TradeExecutionPrice = CanonicalMarketParams<CurrencyAmount | undefined> & { price?: PriceInformation }

export function _constructTradePrice({ sellToken, buyToken, kind, price }: TradeExecutionPrice): Price | undefined {
  if (!sellToken || !buyToken || !price?.amount) return

  let executionPrice: Price | undefined
  // get canonical market tokens
  // to accurately create our Price
  const { baseToken, quoteToken } = getCanonicalMarket({
    sellToken,
    buyToken,
    kind
  })

  if (baseToken && quoteToken && price) {
    executionPrice = new Price(baseToken.currency, quoteToken.currency, baseToken.raw.toString(), price.amount)
  }
  return executionPrice
}

export function _minimumAmountOutExtension(pct: Percent, trade: TradeWithFee) {
  if (trade.tradeType === TradeType.EXACT_OUTPUT) {
    return trade.outputAmount
  }

  const priceDisplayed = trade.executionPrice.invert().raw
  const slippage = new Fraction('1').add(pct)
  // slippage is applied to PRICE
  const slippagePrice = priceDisplayed.multiply(slippage)
  // newly constructed price with slippage applied
  const minPrice = new Price(
    trade.executionPrice.quoteCurrency,
    trade.executionPrice.baseCurrency,
    slippagePrice.denominator,
    slippagePrice.numerator
  )

  const minimumAmountOut = minPrice.invert().quote(trade.inputAmountWithFee)

  return minimumAmountOut
}

export function _maximumAmountInExtension(pct: Percent, trade: TradeWithFee) {
  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return trade.inputAmount
  }
  const priceDisplayed = trade.executionPrice.invert().raw
  const slippage = new Fraction('1').subtract(pct)
  // slippage is applied to the price
  const slippagePrice = priceDisplayed.multiply(slippage)
  // construct new price using slippage price
  const maxPrice = new Price(
    trade.executionPrice.quoteCurrency,
    trade.executionPrice.baseCurrency,
    slippagePrice.denominator,
    slippagePrice.numerator
  )

  // fee is in sell token so we
  // add fee to the calculated input
  const maximumAmountIn = maxPrice
    .invert()
    .quote(trade.outputAmount)
    .add(trade.fee.feeAsCurrency)

  return maximumAmountIn
}

interface TradeParams {
  parsedAmount?: CurrencyAmount
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  quote?: QuoteInformationObject
}

export const stringToCurrency = (amount: string, currency: Currency) =>
  currency instanceof Token ? new TokenAmount(currency, JSBI.BigInt(amount)) : CurrencyAmount.ether(JSBI.BigInt(amount))

/**
 * useTradeExactInWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactInWithFee({
  parsedAmount: parsedInputAmount,
  outputCurrency,
  quote
}: Omit<TradeParams, 'inputCurrency'>) {
  // Original Uni trade hook
  const originalTrade = useTradeExactIn(parsedInputAmount, outputCurrency ?? undefined)

  // make sure we have a typed in amount, a fee, and a price
  // else we can assume the trade will be null
  if (!parsedInputAmount || !originalTrade || !outputCurrency || !quote?.fee || !quote?.price?.amount) return null

  const feeAsCurrency = stringToCurrency(quote.fee.amount, parsedInputAmount.currency)
  // Check that fee amount is not greater than the user's input amt
  const isValidFee = feeAsCurrency.lessThan(parsedInputAmount)
  // If the feeAsCurrency value is higher than we are inputting, return undefined
  // this makes sure `useTradeExactIn` returns null === no trade
  const feeAdjustedAmount = isValidFee ? parsedInputAmount.subtract(feeAsCurrency) : undefined
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency
  }

  // external price output as Currency
  const outputAmount = stringToCurrency(quote.price.amount, outputCurrency)

  // set the Price object to attach to final Trade object
  // Price = (quote.price.amount) / inputAmountAdjustedForFee
  const executionPrice = _constructTradePrice({
    // pass in our parsed sell amount (CurrencyAmount)
    sellToken: feeAdjustedAmount,
    // pass in our feeless outputAmount (CurrencyAmount)
    buyToken: outputAmount,
    kind: 'sell',
    price: quote?.price
  })

  // no price object or feeAdjusted amount? no trade
  if (!executionPrice || !feeAdjustedAmount) return null

  // calculate our output without any fee, consuming price
  // useful for calculating fees in buy token
  const outputAmountWithoutFee = executionPrice.quote(parsedInputAmount)

  return {
    ...originalTrade,
    inputAmountWithFee: feeAdjustedAmount,
    outputAmount,
    outputAmountWithoutFee,
    minimumAmountOut(pct: Percent) {
      // this refers to trade object being constructed
      return _minimumAmountOutExtension(pct, this)
    },
    maximumAmountIn(pct: Percent) {
      // this refers to this trade object being constructed
      return _maximumAmountInExtension(pct, this)
    },
    fee,
    executionPrice
  }
}

/**
 * useTradeExactOutWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactOutWithFee({
  parsedAmount: parsedOutputAmount,
  inputCurrency,
  quote
}: Omit<TradeParams, 'outputCurrency'>) {
  // Original Uni trade hook
  const outTrade = useTradeExactOut(inputCurrency ?? undefined, parsedOutputAmount)

  if (!outTrade || !parsedOutputAmount || !inputCurrency || !quote?.fee || !quote?.price?.amount) return null

  const feeAsCurrency = stringToCurrency(quote.fee.amount, inputCurrency)
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency
  }

  // inputAmount without fee applied
  // this is required for the Trade sdk to calculate slippage adjusted amounts
  const inputAmountWithoutFee = stringToCurrency(quote.price.amount, inputCurrency)
  // We need to determine the fee after, as the parsedOutputAmount isn't known beforehand
  // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
  const inputAmountWithFee = inputAmountWithoutFee.add(feeAsCurrency)

  // per unit price
  const executionPrice = _constructTradePrice({
    // pass in our calculated inputAmount (CurrencyAmount)
    sellToken: inputAmountWithoutFee,
    // pass in our parsed buy amount (CurrencyAmount)
    buyToken: parsedOutputAmount,
    kind: 'buy',
    price: quote.price
  })

  // no price object? no trade
  if (!executionPrice) return null

  // We need to override the Trade object to use different values as we are intercepting initial inputs
  return {
    ...outTrade,
    // overriding inputAmount is a hack
    // to allow us to not have to change Uni's pages/swap/index and use different method names
    // in this case we need to show users the default inputAmount as the inputAmount adjusted for fee
    // this is purely for display reasons and to keep it working with Uni's code.
    inputAmount: inputAmountWithFee,
    inputAmountWithFee,
    minimumAmountOut(pct: Percent) {
      // this refers to trade object being constructed
      return _minimumAmountOutExtension(pct, this)
    },
    maximumAmountIn(pct: Percent) {
      // this refers to trade object being constructed
      return _maximumAmountInExtension(pct, this)
    },
    fee,
    executionPrice
  }
}
