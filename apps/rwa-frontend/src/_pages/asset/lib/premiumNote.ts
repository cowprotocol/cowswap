import { getDividendModel, getDividendNotes } from '@/entities/asset'

const BASE_NOTE = 'Token price compared with the stock price.'

/**
 * Hint for the "vs stock" line of a token. Only a price-accrual token above the stock price gets its premium
 * explained by dividends. `premium` is a fraction, e.g. `0.02` for +2%
 */
export function getPremiumNote(issuer: string, premium: number): string {
  const model = getDividendModel(issuer)
  const explainsDividends = model === 'rebase' || (model === 'price-accrual' && premium > 0)

  return explainsDividends ? `${BASE_NOTE} ${getDividendNotes([issuer])[0]}` : BASE_NOTE
}
