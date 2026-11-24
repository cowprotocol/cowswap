import { atom } from 'jotai'

/** Opposite Wait & Save quote, kept out of `tradeQuotesAtom`. */
export interface WaitAndSaveComparisonQuote {
  buyAmount: string
  /** True when this quote was requested with `enableWaitForCow`. */
  isOnQuote: boolean
  /** Main-quote buy amount this comparison was fetched against. */
  mainBuyAmount: string
}

export const waitAndSaveComparisonQuoteAtom = atom<WaitAndSaveComparisonQuote | null>(null)
