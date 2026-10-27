import { getDividendModel, getDividendNote, getDividendNotes, isWrappedXStock } from './issuers'

const ONDO = { issuer: 'Ondo', coingeckoId: 'nvidia-ondo-tokenized-stock' }
const XSTOCKS = { issuer: 'xStocks', coingeckoId: 'nvidia-xstock' }
const WRAPPED_XSTOCKS = { issuer: 'xStocks', coingeckoId: 'wrapped-nvidia-xstock' }

describe('getDividendModel', () => {
  it('maps every allowed issuer', () => {
    expect(getDividendModel(ONDO)).toBe('price-accrual')
    expect(getDividendModel(XSTOCKS)).toBe('rebase')
  })

  it('treats wrapped xStocks as price-accrual', () => {
    expect(getDividendModel(WRAPPED_XSTOCKS)).toBe('price-accrual')
  })

  it('is null for an unknown issuer', () => {
    expect(getDividendModel({ issuer: 'Dinari' })).toBeNull()
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
    expect(getDividendNote({ issuer: 'Dinari' })).toBeNull()
  })
})

describe('getDividendNotes', () => {
  it('returns one note per distinct label, in first-seen order', () => {
    const notes = getDividendNotes([ONDO, XSTOCKS, ONDO, { issuer: 'Dinari' }, WRAPPED_XSTOCKS, XSTOCKS])

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
