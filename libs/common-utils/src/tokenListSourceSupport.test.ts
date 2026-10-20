import { isDeprecatedTokenListProtocol, isWatcherUnfetchableListSource } from './tokenListSourceSupport'

describe('isDeprecatedTokenListProtocol', () => {
  it('rejects ipfs and ipns, the protocols dropped for new imports', () => {
    expect(isDeprecatedTokenListProtocol('ipfs://QmHash')).toBe(true)
    expect(isDeprecatedTokenListProtocol('ipns://tokens.uniswap.org')).toBe(true)
  })

  it('rejects them regardless of case', () => {
    expect(isDeprecatedTokenListProtocol('IPFS://QmHash')).toBe(true)
    expect(isDeprecatedTokenListProtocol('IpNs://tokens.uniswap.org')).toBe(true)
  })

  it('keeps ENS importable - it still works here, it is only passed to the watcher by address', () => {
    expect(isDeprecatedTokenListProtocol('tokens.uniswap.eth')).toBe(false)
  })

  it('leaves http(s) alone', () => {
    expect(isDeprecatedTokenListProtocol('https://example.com/list.json')).toBe(false)
    expect(isDeprecatedTokenListProtocol('http://example.com/list.json')).toBe(false)
  })
})

describe('isWatcherUnfetchableListSource', () => {
  it('covers every content-addressed protocol, including ar', () => {
    expect(isWatcherUnfetchableListSource('ipfs://QmHash')).toBe(true)
    expect(isWatcherUnfetchableListSource('ipns://tokens.uniswap.org')).toBe(true)
    expect(isWatcherUnfetchableListSource('ar://hash')).toBe(true)
  })

  it('covers ENS names, which are stored raw as the list source', () => {
    expect(isWatcherUnfetchableListSource('tokens.uniswap.eth')).toBe(true)
    expect(isWatcherUnfetchableListSource('tokens.uniswap.eth/list.json')).toBe(true)
  })

  it('leaves http(s) sources on the url side', () => {
    expect(isWatcherUnfetchableListSource('https://example.com/list.json')).toBe(false)
    expect(isWatcherUnfetchableListSource('http://example.com/list.json')).toBe(false)
  })

  it('does not flag sources that are invalid for other reasons', () => {
    expect(isWatcherUnfetchableListSource('')).toBe(false)
    expect(isWatcherUnfetchableListSource('ftp://example.com/list.json')).toBe(false)
    expect(isWatcherUnfetchableListSource('javascript:alert(1)')).toBe(false)
  })
})
