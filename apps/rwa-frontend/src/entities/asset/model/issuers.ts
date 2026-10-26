/**
 * How the issuer passes dividends on to holders.
 * - `price-accrual`: dividends raise the token's redemption price; one token represents a growing number of shares
 * - `rebase`: dividends increase token balances; one token stays one share
 */
export type RwaDividendModel = 'price-accrual' | 'rebase'

/** Must match `ALLOWED_ISSUERS` in `scripts/updateRegistry.mjs`, which skips the tokens of other issuers */
export const RWA_ISSUERS = ['Ondo', 'xStocks'] as const

export type RwaIssuer = (typeof RWA_ISSUERS)[number]

const ISSUER_DIVIDEND_MODELS: Record<RwaIssuer, RwaDividendModel> = {
  Ondo: 'price-accrual',
  xStocks: 'rebase',
}

const DIVIDEND_NOTES: Record<RwaDividendModel, (issuer: string) => string> = {
  'price-accrual': (issuer) =>
    `${issuer} reinvests dividends into the token price, so one token is worth more than one share. The premium over the stock price is accrued dividends, not mispricing.`,
  rebase: (issuer) =>
    `${issuer} reinvests dividends by increasing token balances, so one token stays close to one share.`,
}

export function getDividendModel(issuer: string): RwaDividendModel | null {
  return isRwaIssuer(issuer) ? ISSUER_DIVIDEND_MODELS[issuer] : null
}

/** One note per distinct known issuer, in first-seen order */
export function getDividendNotes(issuers: Iterable<string>): string[] {
  return [...new Set(issuers)].flatMap((issuer) => {
    const model = getDividendModel(issuer)

    return model ? [DIVIDEND_NOTES[model](issuer)] : []
  })
}

function isRwaIssuer(issuer: string): issuer is RwaIssuer {
  return (RWA_ISSUERS as readonly string[]).includes(issuer)
}
