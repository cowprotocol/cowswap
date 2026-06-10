import { validateURL } from './validateURL'

describe('validateURL', () => {
  it('accepts proxy URLs with nested URLs in query params', () => {
    expect(validateURL('https://wispy-bird-88a7.uniswap.workers.dev/?url=http://stablecoin.cmc.eth.link')).toBe(true)
  })

  it('rejects non-http protocols', () => {
    expect(validateURL('ftp://example.com/list.json')).toBe(false)
  })
})
