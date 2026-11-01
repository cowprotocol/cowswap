import { getTokenUsdPrice } from './tokenUsdPrice'

describe('getTokenUsdPrice', () => {
  it('values the shares a token stands for at the stock price when the multiplier is known', () => {
    expect(getTokenUsdPrice(210, 200, 0.99)).toBe(198)
    expect(getTokenUsdPrice(null, 200, 10)).toBe(2000)
  })

  it('uses the token price without a multiplier', () => {
    expect(getTokenUsdPrice(210, 200, null)).toBe(210)
  })

  it('uses the token price without a stock price', () => {
    expect(getTokenUsdPrice(210, null, 0.99)).toBe(210)
  })

  it('falls back to the stock price as one share', () => {
    expect(getTokenUsdPrice(null, 200, null)).toBe(200)
  })

  it('is null without any price', () => {
    expect(getTokenUsdPrice(null, null, 1)).toBeNull()
  })
})
