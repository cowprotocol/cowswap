import { isActiveMetaMaskConnection } from './isActiveMetaMaskConnection'

describe('isActiveMetaMaskConnection', () => {
  it('returns true for MetaMask SDK sessions', () => {
    expect(
      isActiveMetaMaskConnection({
        isInjectedConnection: false,
        isMetaMaskSdkConnection: true,
      }),
    ).toBe(true)
  })

  it('returns false for non-injected sessions even if the browser exposes MetaMask', () => {
    expect(
      isActiveMetaMaskConnection({
        ethereumProvider: { isMetaMask: true },
        isInjectedConnection: false,
        rdns: 'io.metamask',
      }),
    ).toBe(false)
  })

  it('returns false for non-injected sessions with a persisted MetaMask rdns', () => {
    expect(
      isActiveMetaMaskConnection({
        isInjectedConnection: false,
        rdns: 'io.metamask.flask',
      }),
    ).toBe(false)
  })

  it('returns true for injected MetaMask sessions detected by rdns prefix', () => {
    expect(
      isActiveMetaMaskConnection({
        isInjectedConnection: true,
        rdns: 'io.metamask.flask',
      }),
    ).toBe(true)
  })

  it('returns true for generic injected MetaMask sessions detected by provider flags', () => {
    expect(
      isActiveMetaMaskConnection({
        ethereumProvider: { isMetaMask: true },
        isInjectedConnection: true,
      }),
    ).toBe(true)
  })
})
