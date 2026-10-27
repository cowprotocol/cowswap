import type { RwaToken } from './types'

/**
 * How a token passes dividends on to holders.
 * - `price-accrual`: dividends raise the token's redemption price; one token represents a growing number of shares
 * - `rebase`: dividends increase token balances; one token stays one share
 */
export type RwaDividendModel = 'price-accrual' | 'rebase'

/** Must match `ALLOWED_ISSUERS` in `scripts/updateRegistry.mjs`, which skips the tokens of other issuers */
export const RWA_ISSUERS = ['Ondo', 'xStocks'] as const

export interface RwaDividendNote {
  /** Who applies the scheme, e.g. `Ondo` or `Wrapped xStocks` */
  label: string
  /** Short name of the scheme, e.g. `Price accrual` */
  scheme: string
  /** One sentence without the label */
  text: string
}

export type RwaIssuer = (typeof RWA_ISSUERS)[number]

type DividendToken = Pick<RwaToken, 'issuer' | 'coingeckoId'>

const ISSUER_DIVIDEND_MODELS: Record<RwaIssuer, RwaDividendModel> = {
  Ondo: 'price-accrual',
  xStocks: 'rebase',
}

const DIVIDEND_NOTES: Record<RwaDividendModel, Omit<RwaDividendNote, 'label'>> = {
  'price-accrual': {
    scheme: 'Price accrual',
    text: 'Dividends are reinvested into the token price, so one token stands for a growing number of shares.',
  },
  rebase: {
    scheme: 'Rebasing',
    text: 'Dividends are reinvested by increasing token balances, so one token stays close to one share.',
  },
}

const WRAPPED_XSTOCKS_NOTE: RwaDividendNote = {
  label: 'Wrapped xStocks',
  scheme: 'Fixed balance',
  text: 'Balances stay fixed, so one token redeems for a number of shares that grows with dividends.',
}

export function getDividendModel(token: DividendToken): RwaDividendModel | null {
  if (!isRwaIssuer(token.issuer)) return null

  return isWrappedXStock(token) ? 'price-accrual' : ISSUER_DIVIDEND_MODELS[token.issuer]
}

/** `null` for a token of an unknown issuer */
export function getDividendNote(token: DividendToken): RwaDividendNote | null {
  if (isWrappedXStock(token)) return WRAPPED_XSTOCKS_NOTE

  const model = getDividendModel(token)

  return model ? { label: token.issuer, ...DIVIDEND_NOTES[model] } : null
}

/** One note per distinct label of known issuers, in first-seen order */
export function getDividendNotes(tokens: Iterable<DividendToken>): RwaDividendNote[] {
  const notes = new Map<string, RwaDividendNote>()

  for (const token of tokens) {
    const note = getDividendNote(token)

    if (note && !notes.has(note.label)) notes.set(note.label, note)
  }

  return [...notes.values()]
}

/** An ERC-4626 wrapper of a rebasing xStocks token: its balance stays fixed and its price accrues the rebases */
export function isWrappedXStock({ issuer, coingeckoId }: DividendToken): boolean {
  return issuer === 'xStocks' && !!coingeckoId?.startsWith('wrapped-')
}

function isRwaIssuer(issuer: string): issuer is RwaIssuer {
  return (RWA_ISSUERS as readonly string[]).includes(issuer)
}
