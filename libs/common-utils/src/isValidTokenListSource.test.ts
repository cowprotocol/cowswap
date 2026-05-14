import { isValidTokenListSource } from './isValidTokenListSource'

describe('isValidTokenListSource', () => {
  it('accepts http and https URLs', () => {
    expect(isValidTokenListSource('http://example.com/list.json')).toBe(true)
    expect(isValidTokenListSource('https://example.com/list.json')).toBe(true)
  })

  it('accepts uriToHttp-supported protocols and ENS sources', () => {
    expect(isValidTokenListSource('data:application/json,{}')).toBe(true)
    expect(isValidTokenListSource('/@fs/etc/passwd')).toBe(true)
    expect(isValidTokenListSource('ipfs://QmHash')).toBe(true)
    expect(isValidTokenListSource('ipns://tokens.uniswap.org')).toBe(true)
    expect(isValidTokenListSource('ar://hash')).toBe(true)
    expect(isValidTokenListSource('tokens.uniswap.eth')).toBe(true)
    expect(isValidTokenListSource('tokens.uniswap.eth/list.json')).toBe(true)
  })

  it('rejects unsafe or unsupported sources', () => {
    expect(isValidTokenListSource('')).toBe(false)
    expect(isValidTokenListSource('  https://example.com/list.json  ')).toBe(false)
    expect(isValidTokenListSource('\tipfs://QmHash\n')).toBe(false)
    expect(isValidTokenListSource('ftp://example.com/list.json')).toBe(false)
    expect(isValidTokenListSource('file:///tmp/list.json')).toBe(false)
    expect(isValidTokenListSource('javascript:alert(1)')).toBe(false)
    expect(isValidTokenListSource('blob:https://example.com/id')).toBe(false)
  })
})
