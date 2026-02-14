/**
 * Pure function tests for coinbaseWalletApp — no React rendering needed.
 *
 * Component rendering tests live in apps/cowswap-frontend/ because
 * the wallet lib has a React 19 multiple-instances issue that prevents
 * hook-based components from rendering in its test environment.
 */

import { buildDappDeepLink, buildDappUniversalLink } from './coinbaseWalletAppLinks'

describe('buildDappDeepLink', () => {
  it('encodes URL correctly', () => {
    const result = buildDappDeepLink('https://swap.cow.fi/#/1/swap/ETH?foo=bar')

    expect(result).toBe('cbwallet://dapp?url=https%3A%2F%2Fswap.cow.fi%2F%23%2F1%2Fswap%2FETH%3Ffoo%3Dbar')
  })

  it('handles simple URL', () => {
    const result = buildDappDeepLink('https://swap.cow.fi/')

    expect(result).toBe('cbwallet://dapp?url=https%3A%2F%2Fswap.cow.fi%2F')
  })
})

describe('buildDappUniversalLink', () => {
  it('encodes with cb_url param', () => {
    const result = buildDappUniversalLink('https://swap.cow.fi/#/1/swap/ETH')

    expect(result).toBe('https://go.cb-w.com/dapp?cb_url=https%3A%2F%2Fswap.cow.fi%2F%23%2F1%2Fswap%2FETH')
  })

  it('handles simple URL', () => {
    const result = buildDappUniversalLink('https://swap.cow.fi/')

    expect(result).toBe('https://go.cb-w.com/dapp?cb_url=https%3A%2F%2Fswap.cow.fi%2F')
  })
})
