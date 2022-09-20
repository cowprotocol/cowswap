import { Currency, CurrencyAmount, Percent /* , Fraction, TradeType */ } from '@uniswap/sdk-core'

import TradeGp from 'state/swap/TradeGp'
import { Field } from 'state/swap/actions'

// There's no MOD file as originals aren't touched, only new functions added
export * from '@src/utils/prices'

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  //   trade: Trade | undefined,
  trade: TradeGp | undefined,
  allowedSlippage: Percent
): { [field in Field]?: CurrencyAmount<Currency> } {
  return {
    [Field.INPUT]: trade?.maximumAmountIn(allowedSlippage),
    [Field.OUTPUT]: trade?.minimumAmountOut(allowedSlippage),
  }
}

// export function formatExecutionPrice(trade?: Trade, inverted?: boolean): string {
export function formatExecutionPrice(trade?: TradeGp, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${
        trade.outputAmount.currency.symbol
      }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${
        trade.inputAmount.currency.symbol
      }`
}
