import { isActiveCoinbaseConnection } from './isActiveCoinbaseConnection'

describe('isActiveCoinbaseConnection', () => {
  it('returns true for explicit Coinbase connector sessions', () => {
    expect(
      isActiveCoinbaseConnection({
        isCoinbaseConnector: true,
        isInjectedConnection: false,
      }),
    ).toBe(true)
  })

  it('returns false for non-injected sessions without the Coinbase connector', () => {
    expect(
      isActiveCoinbaseConnection({
        ethereumProvider: { isCoinbaseWallet: true },
        isInjectedConnection: false,
        trustedRdns: 'com.coinbase.wallet',
      }),
    ).toBe(false)
  })

  it('returns true for injected Coinbase sessions detected by provider flags', () => {
    expect(
      isActiveCoinbaseConnection({
        ethereumProvider: { isCoinbaseWallet: true },
        isInjectedConnection: true,
      }),
    ).toBe(true)
  })

  it('returns true for injected Coinbase sessions detected by trusted rdns', () => {
    expect(
      isActiveCoinbaseConnection({
        isInjectedConnection: true,
        trustedRdns: 'com.coinbase.wallet',
      }),
    ).toBe(true)
  })
})
