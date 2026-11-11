import {
  getDividendModel,
  getDividendNote,
  getDividendNotes,
  hasUiMultiplier,
  isVaultToken,
  isWrappedXStock,
} from './issuers'

const ONDO = { issuer: 'Ondo', coingeckoId: 'nvidia-ondo-tokenized-stock' }
const XSTOCKS = { issuer: 'xStocks', coingeckoId: 'nvidia-xstock' }
const WRAPPED_XSTOCKS = { issuer: 'xStocks', coingeckoId: 'wrapped-nvidia-xstock' }

describe('getDividendModel', () => {
  it('maps every allowed issuer', () => {
    expect(getDividendModel(ONDO)).toBe('price-accrual')
    expect(getDividendModel(XSTOCKS)).toBe('rebase')
    expect(getDividendModel({ issuer: 'Coinbase' })).toBe('price-accrual')
    expect(getDividendModel({ issuer: 'bStocks' })).toBe('rebase')
    expect(getDividendModel({ issuer: 'Reality' })).toBe('cash-payout')
    expect(getDividendModel({ issuer: 'Dinari' })).toBe('cash-payout')
    expect(getDividendModel({ issuer: 'Robinhood Assets (Jersey) Limited' })).toBe('price-accrual')
    expect(getDividendModel({ issuer: 'Anchored Capital Ltd (BVI)' })).toBe('cash-payout')
    expect(getDividendModel({ issuer: 'ST0x' })).toBe('price-accrual')
  })

  it('treats wrapped xStocks as price-accrual', () => {
    expect(getDividendModel(WRAPPED_XSTOCKS)).toBe('price-accrual')
  })

  it('is null for an issuer with an undocumented model', () => {
    expect(getDividendModel({ issuer: 'Stove Finance' })).toBeNull()
    expect(getDividendModel({ issuer: 'Securitize' })).toBeNull()
  })

  it('is null for a commodity issuer', () => {
    expect(getDividendModel({ issuer: 'Paxos' })).toBeNull()
    expect(getDividendModel({ issuer: 'Tether' })).toBeNull()
  })
})

describe('getDividendNote', () => {
  it('labels a note with the issuer and names its scheme', () => {
    expect(getDividendNote(ONDO)).toEqual({
      label: 'Ondo',
      scheme: 'Price accrual',
      text: 'Dividends are reinvested into the token price, so one token stands for a growing number of shares.',
    })
  })

  it('describes wrapped xStocks apart from rebasing ones', () => {
    expect(getDividendNote(WRAPPED_XSTOCKS)).toMatchObject({ label: 'Wrapped xStocks', scheme: 'Fixed balance' })
    expect(getDividendNote(XSTOCKS)).toMatchObject({ label: 'xStocks', scheme: 'Rebasing' })
  })

  it('is null for an unknown issuer', () => {
    expect(getDividendNote({ issuer: 'Stove Finance' })).toBeNull()
  })
})

describe('getDividendNotes', () => {
  it('returns one note per distinct label, in first-seen order', () => {
    const notes = getDividendNotes([ONDO, XSTOCKS, ONDO, { issuer: 'Stove Finance' }, WRAPPED_XSTOCKS, XSTOCKS])

    expect(notes.map(({ label }) => label)).toEqual(['Ondo', 'xStocks', 'Wrapped xStocks'])
  })

  it('is empty without known issuers', () => {
    expect(getDividendNotes([])).toEqual([])
  })
})

describe('isWrappedXStock', () => {
  it('matches xStocks tokens with a wrapped CoinGecko id only', () => {
    expect(isWrappedXStock(WRAPPED_XSTOCKS)).toBe(true)
    expect(isWrappedXStock(XSTOCKS)).toBe(false)
    expect(isWrappedXStock({ issuer: 'xStocks' })).toBe(false)
    expect(isWrappedXStock({ issuer: 'Ondo', coingeckoId: 'wrapped-nvidia-xstock' })).toBe(false)
  })
})

describe('isVaultToken', () => {
  it('matches wrapped xStocks and ST0x tokens', () => {
    expect(isVaultToken(WRAPPED_XSTOCKS)).toBe(true)
    expect(isVaultToken({ issuer: 'ST0x', coingeckoId: 'nike-st0x-tokenized-stock' })).toBe(true)
    expect(isVaultToken(XSTOCKS)).toBe(false)
    expect(isVaultToken(ONDO)).toBe(false)
  })
})

describe('hasUiMultiplier', () => {
  it('matches Robinhood tokens only', () => {
    expect(hasUiMultiplier({ issuer: 'Robinhood Assets (Jersey) Limited' })).toBe(true)
    expect(hasUiMultiplier(ONDO)).toBe(false)
  })
})
