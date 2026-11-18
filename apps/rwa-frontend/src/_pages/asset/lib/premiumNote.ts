import { getDividendModel, getDividendNote, type RwaToken } from '@/entities/asset'

const BASE_NOTE = 'Token price per share compared with the stock price.'
const ACCRUED_DIVIDENDS_NOTE = 'The premium over the stock price is accrued dividends, not mispricing.'

const PARAGRAPH_BREAK = '\n\n'

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
    return `One ${token.symbol} stands for ${sharesFormatter.format(sharesPerToken)} shares.${PARAGRAPH_BREAK}${BASE_NOTE}`
  }

  const model = getDividendModel(token)
  const note = getDividendNote(token)

  if ((model === 'rebase' || model === 'cash-payout') && note)
    return `${note.label}: ${note.text}${PARAGRAPH_BREAK}${BASE_NOTE}`
  if (model === 'price-accrual' && note && sharesPerToken === null && premium > 0) {
    return `${note.label}: ${note.text} ${ACCRUED_DIVIDENDS_NOTE}${PARAGRAPH_BREAK}${BASE_NOTE}`
  }

  return BASE_NOTE
}
