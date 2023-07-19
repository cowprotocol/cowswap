import { useAtomValue } from 'jotai'

import { useSetTradeQuoteParams } from 'modules/tradeQuote'

import { partsStateAtom } from '../state/partsStateAtom'

export function QuoteParamsUpdater() {
  const { inputPartAmount } = useAtomValue(partsStateAtom)

  useSetTradeQuoteParams(inputPartAmount)

  return null
}
