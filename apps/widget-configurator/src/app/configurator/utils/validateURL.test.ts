import { validateURL } from './validateURL'

describe('validateURL', () => {
  it('accepts proxy URLs with nested URLs in query params', () => {
    expect(validateURL('https://wispy-bird-88a7.uniswap.workers.dev/?url=http://stablecoin.cmc.eth.link')).toBe(true)
  })

  it('rejects non-http protocols', () => {
    expect(validateURL('ftp://example.com/list.json')).toBe(false)
  })

  it('rejects data, ipfs, ipns, ar and /@fs/ schemes', () => {
    expect(validateURL('data:application/json,{}')).toBe(false)
    expect(validateURL('ipfs://QmHash')).toBe(false)
    expect(validateURL('ipns://example.eth')).toBe(false)
    expect(validateURL('ar://hash')).toBe(false)
    expect(validateURL('/@fs/etc/passwd')).toBe(false)
  })

  it('accepts plain http and https URLs', () => {
    expect(validateURL('http://example.com/list.json')).toBe(true)
    expect(validateURL('https://example.com/list.json')).toBe(true)
  })
})
