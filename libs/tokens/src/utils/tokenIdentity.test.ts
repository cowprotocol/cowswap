import { TokenWithLogo } from '@cowprotocol/common-const'

import { doesSymbolResolveToAddress, excludeAlreadyActiveTokens } from './tokenIdentity'

// Real Base addresses: the Coinbase RWA list ships AAPL here, CoinGecko ships the same address as AAPLC
const AAPL_ADDRESS = '0xb200000000000000000000C2e324d24d7eEcd1fb'
const OTHER_ADDRESS = '0xb2000000000000000000002D0BA3164cc74f58B7'

function token(symbol: string, address: string): TokenWithLogo {
  return new TokenWithLogo(undefined, 8453, address, 18, symbol, symbol)
}

describe('doesSymbolResolveToAddress', () => {
  it('resolves when the symbol maps back to the same address', () => {
    const tokensBySymbol = { aapl: [token('AAPL', AAPL_ADDRESS)] }

    expect(doesSymbolResolveToAddress(tokensBySymbol, 'AAPL', AAPL_ADDRESS)).toBe(true)
  })

  // The two lists ship the same address in different case: checksummed vs all-lowercase
  it('matches a checksummed address against a lowercase one, and ignores symbol case', () => {
    const tokensBySymbol = { aapl: [token('AAPL', AAPL_ADDRESS.toLowerCase())] }

    expect(doesSymbolResolveToAddress(tokensBySymbol, 'aApL', AAPL_ADDRESS)).toBe(true)
  })

  // The regression: the address is active, but under AAPLC, so AAPL resolves to nothing
  it('does not resolve when the address is active under a different symbol', () => {
    const tokensBySymbol = { aaplc: [token('AAPLC', AAPL_ADDRESS)] }

    expect(doesSymbolResolveToAddress(tokensBySymbol, 'AAPL', AAPL_ADDRESS)).toBe(false)
  })

  it('does not resolve when the symbol maps to a different address', () => {
    const tokensBySymbol = { aapl: [token('AAPL', OTHER_ADDRESS)] }

    expect(doesSymbolResolveToAddress(tokensBySymbol, 'AAPL', AAPL_ADDRESS)).toBe(false)
  })

  it('does not resolve for an unknown symbol or missing input', () => {
    expect(doesSymbolResolveToAddress({}, 'AAPL', AAPL_ADDRESS)).toBe(false)
    expect(doesSymbolResolveToAddress({}, null, AAPL_ADDRESS)).toBe(false)
    expect(doesSymbolResolveToAddress({}, 'AAPL', undefined)).toBe(false)
  })
})

describe('excludeAlreadyActiveTokens', () => {
  it('drops tokens whose address is already active, regardless of address case', () => {
    const importable = [token('AAPL', AAPL_ADDRESS), token('GOOGL', OTHER_ADDRESS)]
    const tokensByAddress = { [AAPL_ADDRESS.toLowerCase()]: token('AAPLC', AAPL_ADDRESS.toLowerCase()) }

    expect(excludeAlreadyActiveTokens(importable, tokensByAddress).map((t) => t.symbol)).toEqual(['GOOGL'])
  })

  it('keeps tokens that are not active', () => {
    const importable = [token('AAPL', AAPL_ADDRESS)]

    expect(excludeAlreadyActiveTokens(importable, {})).toHaveLength(1)
  })
})
