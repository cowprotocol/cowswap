import { useAtomValue } from 'jotai'

import { shouldHideQuoteAmountsAtom } from '../state/shouldHideQuoteAmounts.atom'

export function useShouldHideQuoteAmounts(): boolean {
  return useAtomValue(shouldHideQuoteAmountsAtom)
}
