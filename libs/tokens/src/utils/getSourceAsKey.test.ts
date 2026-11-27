import { getSourceAsKey } from './getSourceAsKey'

describe('getSourceAsKey', () => {
  it('converts to lowercase', () => {
    expect(getSourceAsKey('HTTPS://EXAMPLE.COM/list.json')).toBe('https://example.com/list.json')
  })

  it('trims whitespace', () => {
    expect(getSourceAsKey('  https://example.com/list.json  ')).toBe('https://example.com/list.json')
  })

  it('handles mixed case and whitespace', () => {
    expect(getSourceAsKey('  HTTPS://Example.COM/List.JSON  ')).toBe('https://example.com/list.json')
  })

  it('gives every recognized git ref of a GitHub raw list the same key', () => {
    const base = 'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list'
    const expected = `${base}/tokenlist.json`

    expect(getSourceAsKey(`${base}/main/tokenlist.json`)).toBe(expected)
    expect(getSourceAsKey(`${base}/master/tokenlist.json`)).toBe(expected)
    expect(getSourceAsKey(`${base}/refs/heads/main/tokenlist.json`)).toBe(expected)
    expect(getSourceAsKey(`${base}/cf97552db394cc10bffab7ac942805a89a882039/tokenlist.json`)).toBe(expected)
  })

  it('leaves a ref it cannot delimit verbatim rather than guessing', () => {
    const base = 'https://raw.githubusercontent.com/acme/repo'
    const slashBranch = `${base}/refs/heads/release/v1/tokenlist.json`

    // `release/v1` + `tokenlist.json` and `release` + `v1/tokenlist.json` are indistinguishable
    expect(getSourceAsKey(slashBranch)).toBe(slashBranch)
    expect(getSourceAsKey(`${base}/refs/tags/v1.2.0/tokenlist.json`)).toBe(`${base}/refs/tags/v1.2.0/tokenlist.json`)
  })

  it('never merges two different files in the same repo', () => {
    const base = 'https://raw.githubusercontent.com/acme/repo'

    // Both used to normalize to `${base}/v1/tokenlist.json`, which would have deduped them together
    expect(getSourceAsKey(`${base}/refs/heads/release/v1/tokenlist.json`)).not.toBe(
      getSourceAsKey(`${base}/refs/heads/main/v1/tokenlist.json`),
    )
    expect(getSourceAsKey(`${base}/main/a.json`)).not.toBe(getSourceAsKey(`${base}/main/b.json`))
  })

  it('keeps nested paths intact when dropping the ref', () => {
    const base = 'https://raw.githubusercontent.com/reserve-protocol/dtf-interface'
    const path = 'packages/dtf-catalog/tokenlists/index-dtf/restricted/bnb.tokenlist.json'

    expect(getSourceAsKey(`${base}/refs/heads/main/${path}`)).toBe(`${base}/${path}`)
    expect(getSourceAsKey(`${base}/1dbc095c95210f3342278acb8b865763a4d7d443/${path}`)).toBe(`${base}/${path}`)
  })

  it('leaves non-GitHub sources untouched', () => {
    expect(getSourceAsKey('https://files.cow.fi/token-lists/CoinGecko.1.json')).toBe(
      'https://files.cow.fi/token-lists/coingecko.1.json',
    )
    expect(getSourceAsKey('https://ipfs.io/ipns/tokens.uniswap.org')).toBe('https://ipfs.io/ipns/tokens.uniswap.org')
  })

  it('does not collapse different lists in the same repo', () => {
    const base = 'https://raw.githubusercontent.com/backed-fi/cowswap-xstocks-tokenlist'

    expect(getSourceAsKey(`${base}/main/tokenlist.json`)).not.toBe(getSourceAsKey(`${base}/main/other.json`))
  })
})
