import { isDeprecatedTokenListSource, isWatcherUnfetchableListSource } from './tokenListSourceSupport'

describe('isDeprecatedTokenListSource', () => {
  it('rejects ipfs and ipns, the protocols dropped for new imports', () => {
    expect(isDeprecatedTokenListSource('ipfs://QmHash')).toBe(true)
    expect(isDeprecatedTokenListSource('ipns://tokens.uniswap.org')).toBe(true)
  })

  it('rejects them regardless of case', () => {
    expect(isDeprecatedTokenListSource('IPFS://QmHash')).toBe(true)
    expect(isDeprecatedTokenListSource('IpNs://tokens.uniswap.org')).toBe(true)
  })

  it('rejects http gateway urls, which are the same content behind an https url', () => {
    expect(isDeprecatedTokenListSource('https://cloudflare-ipfs.com/ipns/tokens.uniswap.org')).toBe(true)
    expect(isDeprecatedTokenListSource('https://ipfs.io/ipfs/QmHash/list.json')).toBe(true)
    expect(isDeprecatedTokenListSource('http://ipfs.io/ipns/tokens.uniswap.org')).toBe(true)
    expect(isDeprecatedTokenListSource('https://QmHash.ipfs.dweb.link/')).toBe(true)
  })

  it('rejects ENS names, whose contenthash resolves to ipfs/ipns', () => {
    expect(isDeprecatedTokenListSource('tokens.uniswap.eth')).toBe(true)
    expect(isDeprecatedTokenListSource('defi.cmc.eth')).toBe(true)
    expect(isDeprecatedTokenListSource('tokens.uniswap.eth/list.json')).toBe(true)
  })

  it('leaves ordinary http(s) alone', () => {
    expect(isDeprecatedTokenListSource('https://example.com/list.json')).toBe(false)
    expect(isDeprecatedTokenListSource('http://example.com/list.json')).toBe(false)
    expect(isDeprecatedTokenListSource('https://example.com/ipfs-tokens/list.json')).toBe(false)
  })

  it('keeps ar importable - it is not part of the ipfs deprecation', () => {
    expect(isDeprecatedTokenListSource('ar://hash')).toBe(false)
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

  it('covers http gateway urls, which fail the session when the gateway is down', () => {
    expect(isWatcherUnfetchableListSource('https://cloudflare-ipfs.com/ipns/tokens.uniswap.org')).toBe(true)
    expect(isWatcherUnfetchableListSource('https://ipfs.io/ipfs/QmHash/list.json')).toBe(true)
    expect(isWatcherUnfetchableListSource('https://QmHash.ipfs.dweb.link/')).toBe(true)
  })

  it('leaves ordinary http(s) sources on the url side', () => {
    expect(isWatcherUnfetchableListSource('https://example.com/list.json')).toBe(false)
    expect(isWatcherUnfetchableListSource('http://example.com/list.json')).toBe(false)
  })

  it('covers every other non-http(s) source, which the watcher guard turns down outright', () => {
    expect(isWatcherUnfetchableListSource('data:application/json,{"tokens":[]}')).toBe(true)
    expect(isWatcherUnfetchableListSource('ftp://example.com/list.json')).toBe(true)
    expect(isWatcherUnfetchableListSource('javascript:alert(1)')).toBe(true)
    expect(isWatcherUnfetchableListSource('')).toBe(true)
  })
})
