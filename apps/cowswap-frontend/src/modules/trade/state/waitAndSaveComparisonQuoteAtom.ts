import { atom } from 'jotai'

/** Opposite Wait & Save quote, kept out of `tradeQuotesAtom`. */
export interface WaitAndSaveComparisonQuote {
  buyAmount: string
  sellAmount: string
  /** Network fee on this side quote. Gross sell is `sellAmount + feeAmount`. */
  feeAmount: string
  /** True when this side request was the Wait & Save quote. */
  enableWaitForCow: boolean
  /** Main-quote buy amount this comparison was fetched against. */
  mainBuyAmount: string
  /** Main-quote sell amount this comparison was fetched against. */
  mainSellAmount: string
  /** Main-quote network fee this comparison was fetched against. */
  mainFeeAmount: string
}

export const waitAndSaveComparisonQuoteAtom = atom<WaitAndSaveComparisonQuote | null>(null)
