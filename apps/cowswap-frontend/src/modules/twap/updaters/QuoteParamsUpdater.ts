import { useAtomValue } from 'jotai'

import { useSetTradeQuoteParams } from 'modules/tradeQuote'

import { partsStateAtom } from '../state/partsStateAtom'

/**
 * There is a generic module `modules/tradeQuote` that is supposed to be used by all trade widgets (swap/limit/advanced).
 * Since each trade widget has its own parameters for quote, we need to update the trade quote params in the generic module.
 * For limit orders we just use inputted amount as quote amount, but for TWAP we need to use the amount of the part.
 * useSetTradeQuoteParams() just fill the quote amount into `tradeQuoteParamsAtom` that is used by `useQuoteParams`.
 */
export function QuoteParamsUpdater() {
  const { inputPartAmount } = useAtomValue(partsStateAtom)

  useSetTradeQuoteParams(inputPartAmount)

  return null
}
