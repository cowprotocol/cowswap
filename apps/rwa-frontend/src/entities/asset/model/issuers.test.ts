import { getDividendModel, getDividendNotes } from './issuers'

describe('getDividendModel', () => {
  it('maps every allowed issuer', () => {
    expect(getDividendModel('Ondo')).toBe('price-accrual')
    expect(getDividendModel('xStocks')).toBe('rebase')
  })

  it('is null for an unknown issuer', () => {
    expect(getDividendModel('Dinari')).toBeNull()
  })
})

describe('getDividendNotes', () => {
  it('returns one note per distinct known issuer', () => {
    expect(getDividendNotes(['Ondo', 'xStocks', 'Ondo', 'Dinari'])).toEqual([
      'Ondo reinvests dividends into the token price, so one token is worth more than one share. The premium over the stock price is accrued dividends, not mispricing.',
      'xStocks reinvests dividends by increasing token balances, so one token stays close to one share.',
    ])
  })

  it('is empty without known issuers', () => {
    expect(getDividendNotes([])).toEqual([])
  })
})
