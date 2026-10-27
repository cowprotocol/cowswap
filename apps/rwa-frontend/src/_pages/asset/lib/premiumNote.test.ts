import { getPremiumNote } from './premiumNote'

const BASE = 'Token price per share compared with the stock price.'
const ONDO = { symbol: 'NVDAon', issuer: 'Ondo', coingeckoId: 'nvidia-ondo-tokenized-stock' }
const XSTOCKS = { symbol: 'NVDAx', issuer: 'xStocks', coingeckoId: 'nvidia-xstock' }
const ONDO_NOTE =
  'Ondo: Dividends are reinvested into the token price, so one token stands for a growing number of shares.'

describe('getPremiumNote', () => {
  it('gives the shares a token stands for when its price is per share', () => {
    expect(getPremiumNote(ONDO, 1.00171524, 0.0003)).toBe(`${BASE} One NVDAon stands for 1.0017 shares.`)
    expect(getPremiumNote(ONDO, 10, -0.001)).toBe(`${BASE} One NVDAon stands for 10 shares.`)
  })

  it('has only the base hint for a price-accrual token of one share', () => {
    expect(getPremiumNote(ONDO, 1, 0.02)).toBe(BASE)
  })

  it('explains the premium of a price-accrual token without its multiplier', () => {
    expect(getPremiumNote(ONDO, null, 0.02)).toBe(
      `${BASE} ${ONDO_NOTE} The premium over the stock price is accrued dividends, not mispricing.`,
    )
  })

  it('does not attribute a discount of a price-accrual token to dividends', () => {
    expect(getPremiumNote(ONDO, null, 0)).toBe(BASE)
    expect(getPremiumNote(ONDO, null, -0.0012)).toBe(BASE)
  })

  it('explains a rebasing token at any premium', () => {
    const note = `${BASE} xStocks: Dividends are reinvested by increasing token balances, so one token stays close to one share.`

    expect(getPremiumNote(XSTOCKS, 1, 0.02)).toBe(note)
    expect(getPremiumNote(XSTOCKS, null, -0.0007)).toBe(note)
  })

  it('explains a cash-payout token at any premium', () => {
    const reality = { symbol: 'RNVDA', issuer: 'Reality', coingeckoId: 'nvidia-rstock' }
    const note = `${BASE} Reality: Dividends are paid out separately in stablecoins, so one token stays close to one share.`

    expect(getPremiumNote(reality, 1, 0.02)).toBe(note)
  })

  it('has only the base hint for an unknown issuer', () => {
    expect(getPremiumNote({ symbol: 'NVDAd', issuer: 'Dinari' }, null, 0.02)).toBe(BASE)
  })
})
