import type { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

/**
 * This function maps CurrencyInfo corresponding to the flags
 * It hides the amount when the quote is loading or there is an error depending on order kind
 */
export function mapCurrencyInfo(
  originalInfo: CurrencyInfo,
  amountBelongsToQuote: boolean,
  hideQuoteAmount: boolean,
): CurrencyInfo {
  return {
    ...originalInfo,
    amount: amountBelongsToQuote && hideQuoteAmount ? null : originalInfo.amount,
    receiveAmountInfo: !hideQuoteAmount ? originalInfo.receiveAmountInfo : null,
  }
}
