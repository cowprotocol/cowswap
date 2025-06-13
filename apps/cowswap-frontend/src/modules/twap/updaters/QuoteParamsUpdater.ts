import { useAtomValue } from 'jotai'

import { useSetTradeQuoteParams } from 'modules/tradeQuote'

import { useAdvancedOrdersDerivedState } from '../../advancedOrders'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

/**
 * There is a generic module `modules/tradeQuote` that is supposed to be used by all trade widgets (swap/limit/advanced).
 * Since each trade widget has its own parameters for quote, we need to update the trade quote params in the generic module.
 * For limit orders we just use inputted amount as quote amount, but for TWAP we need to use the amount of the part.
 * useSetTradeQuoteParams() just fill the quote amount into `tradeQuoteParamsAtom` that is used by `useQuoteParams`.
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function QuoteParamsUpdater() {
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)

  const inputPartAmount = inputCurrencyAmount?.divide(numberOfPartsValue)

  useSetTradeQuoteParams({ amount: inputPartAmount })

  return null
}
