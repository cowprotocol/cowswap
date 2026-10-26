import { getPremiumNote } from './premiumNote'

const BASE = 'Token price compared with the stock price.'

describe('getPremiumNote', () => {
  it('explains the premium of a price-accrual issuer', () => {
    expect(getPremiumNote('Ondo', 0.02)).toBe(
      `${BASE} Ondo reinvests dividends into the token price, so one token is worth more than one share. The premium over the stock price is accrued dividends, not mispricing.`,
    )
  })

  it('does not attribute a discount of a price-accrual token to dividends', () => {
    expect(getPremiumNote('Ondo', 0)).toBe(BASE)
    expect(getPremiumNote('Ondo', -0.0012)).toBe(BASE)
  })

  it('explains a rebasing issuer at any premium', () => {
    const note = `${BASE} xStocks reinvests dividends by increasing token balances, so one token stays close to one share.`

    expect(getPremiumNote('xStocks', 0.02)).toBe(note)
    expect(getPremiumNote('xStocks', -0.0007)).toBe(note)
  })

  it('has only the base hint for an unknown issuer', () => {
    expect(getPremiumNote('Dinari', 0.02)).toBe(BASE)
  })
})
