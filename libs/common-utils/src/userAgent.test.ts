describe('userAgent', () => {
  afterEach(() => {
    jest.resetModules()
    delete (window as Window & { ethereum?: unknown }).ethereum
  })

  it('does not throw when an injected wallet bridge throws on access', () => {
    Object.defineProperty(window, 'ethereum', {
      configurable: true,
      get() {
        throw new Error('provider unavailable')
      },
    })

    let userAgentModule: typeof import('./userAgent') | undefined

    expect(() => {
      jest.isolateModules(() => {
        userAgentModule = require('./userAgent') as typeof import('./userAgent')
      })
    }).not.toThrow()

    expect(userAgentModule?.isCoinbaseWalletBrowser).toBe(false)
  })
})
