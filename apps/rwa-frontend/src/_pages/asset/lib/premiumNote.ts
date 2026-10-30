import { getDividendModel, getDividendNote, type RwaToken } from '@/entities/asset'

const BASE_NOTE = 'Token price per share compared with the stock price.'
const ACCRUED_DIVIDENDS_NOTE = 'The premium over the stock price is accrued dividends, not mispricing.'

const sharesFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 })

/**
 * Hint for the "vs stock" line of a token whose price is divided by `sharesPerToken`, or left per token without it.
 * Then only a price-accrual token above the stock price gets its premium explained by dividends.
 * `premium` is a fraction, e.g. `0.02` for +2%
 */
export function getPremiumNote(
  token: Pick<RwaToken, 'symbol' | 'issuer' | 'coingeckoId'>,
  sharesPerToken: number | null,
  premium: number,
): string {
  if (sharesPerToken !== null && sharesPerToken !== 1) {
    return `${BASE_NOTE} One ${token.symbol} stands for ${sharesFormatter.format(sharesPerToken)} shares.`
  }

  const model = getDividendModel(token)
  const note = getDividendNote(token)

  if ((model === 'rebase' || model === 'cash-payout') && note) return `${BASE_NOTE} ${note.label}: ${note.text}`
  if (model === 'price-accrual' && note && sharesPerToken === null && premium > 0) {
    return `${BASE_NOTE} ${note.label}: ${note.text} ${ACCRUED_DIVIDENDS_NOTE}`
  }

  return BASE_NOTE
}
