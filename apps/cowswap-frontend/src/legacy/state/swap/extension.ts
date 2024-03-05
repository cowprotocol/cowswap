import { bpsToPercent } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import TradeGp, { _constructTradePrice } from './TradeGp'

import { QuoteInformationObject } from '../price/reducer'

interface TradeParams {
  parsedAmount?: CurrencyAmount<Currency>
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  quote?: Pick<QuoteInformationObject, 'fee' | 'price'>
  partnerFee?: PartnerFee
}

export const stringToCurrency = (amount: string, currency: Currency) =>
  CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(amount))

export const tryAtomsToCurrency = (atoms: string | undefined, currency: Currency | undefined) => {
  if (!atoms || !currency) return undefined

  return stringToCurrency(atoms, currency)
}

/**
 * useTradeExactInWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function buildTradeExactInWithFee({
  parsedAmount: parsedInputAmount,
  outputCurrency,
  quote,
  partnerFee,
}: Omit<TradeParams, 'inputCurrency'>) {
  // make sure we have a typed in amount, a fee, and a price
  // else we can assume the trade will be undefined
  if (!parsedInputAmount || !outputCurrency || !quote?.fee || !quote?.price?.amount) return undefined

  const feeAsCurrency = stringToCurrency(quote.fee.amount, parsedInputAmount.currency)
  // Check that fee amount is not greater than the user's input amt
  const isValidFee = feeAsCurrency.lessThan(parsedInputAmount)
  // If the feeAsCurrency value is higher than we are inputting, return undefined
  // this makes sure `useTradeExactIn` returns null === no trade
  const feeAdjustedAmount = isValidFee ? parsedInputAmount.subtract(feeAsCurrency) : undefined
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency,
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
    kind: OrderKind.SELL,
    price: quote?.price,
  })

  // no price object or feeAdjusted amount? no trade
  if (!executionPrice || !feeAdjustedAmount) return undefined

  // calculate our output without any fee, consuming price
  // useful for calculating fees in buy token
  const outputAmountWithoutFee = executionPrice.quote(parsedInputAmount)

  const partnerFeeAmount = partnerFee ? outputAmountWithoutFee.multiply(bpsToPercent(partnerFee.bps)) : undefined
  const outputAmountAfterFees = partnerFeeAmount ? outputAmount.subtract(partnerFeeAmount) : outputAmount

  return new TradeGp({
    inputAmount: parsedInputAmount,
    inputAmountWithFee: feeAdjustedAmount,
    inputAmountAfterFees: feeAdjustedAmount,
    inputAmountWithoutFee: parsedInputAmount,
    outputAmount,
    outputAmountWithoutFee,
    outputAmountAfterFees,
    fee,
    executionPrice,
    tradeType: TradeType.EXACT_INPUT,
    quoteId: quote.price.quoteId,
    partnerFee,
    partnerFeeAmount,
  })
}

/**
 * useTradeExactOutWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function buildTradeExactOutWithFee({
  parsedAmount: parsedOutputAmount,
  inputCurrency,
  quote,
  partnerFee,
}: Omit<TradeParams, 'outputCurrency'>) {
  if (!parsedOutputAmount || !inputCurrency || !quote?.fee || !quote?.price?.amount) return undefined

  const feeAsCurrency = stringToCurrency(quote.fee.amount, inputCurrency)
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency,
  }

  // inputAmount without fee applied
  // this is required for the Trade sdk to calculate slippage adjusted amounts
  const inputAmountWithoutFee = stringToCurrency(quote.price.amount, inputCurrency)
  // We need to determine the fee after, as the parsedOutputAmount isn't known beforehand
  // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
  const inputAmountWithFee = inputAmountWithoutFee.add(feeAsCurrency)
  // Partner fee
  const partnerFeeAmount = partnerFee ? inputAmountWithoutFee.multiply(bpsToPercent(partnerFee.bps)) : undefined
  const inputAmountAfterFees = partnerFeeAmount ? inputAmountWithFee.add(partnerFeeAmount) : inputAmountWithFee

  // per unit price
  const executionPrice = _constructTradePrice({
    // pass in our calculated inputAmount (CurrencyAmount)
    sellToken: inputAmountWithoutFee,
    // pass in our parsed buy amount (CurrencyAmount)
    buyToken: parsedOutputAmount,
    kind: OrderKind.BUY,
    price: quote.price,
  })

  // no price object? no trade
  if (!executionPrice) return undefined

  // We need to override the Trade object to use different values as we are intercepting initial inputs
  return new TradeGp({
    inputAmount: inputAmountWithFee,
    inputAmountWithFee,
    inputAmountWithoutFee,
    inputAmountAfterFees,
    outputAmount: parsedOutputAmount,
    outputAmountWithoutFee: parsedOutputAmount,
    outputAmountAfterFees: parsedOutputAmount,
    fee,
    executionPrice,
    tradeType: TradeType.EXACT_OUTPUT,
    quoteId: quote.price.quoteId,
    partnerFee,
    partnerFeeAmount,
  })
}
