import { parseCustomTokensInput } from './parseCustomTokensInput'

describe('parseCustomTokensInput', () => {
  const token = {
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  }

  it('accepts raw token arrays', () => {
    expect(parseCustomTokensInput(JSON.stringify([token]))).toEqual([token])
  })

  it('accepts standard token list objects', () => {
    expect(
      parseCustomTokensInput(
        JSON.stringify({
          name: 'Stablecoins',
          timestamp: '2020-08-25T12:00:15+00:00',
          version: { major: 0, minor: 0, patch: 0 },
          tokens: [token],
        }),
      ),
    ).toEqual([token])
  })

  it('rejects unsupported JSON shapes', () => {
    expect(parseCustomTokensInput(JSON.stringify({ foo: 'bar' }))).toBeNull()
  })
})
