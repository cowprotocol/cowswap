import { getInjectedProvider, getIsInjected } from './connection'

describe('connection utils', () => {
  afterEach(() => {
    delete (window as Window & { ethereum?: unknown }).ethereum
  })

  it('returns false when an injected wallet bridge throws on access', () => {
    Object.defineProperty(window, 'ethereum', {
      configurable: true,
      get() {
        throw new Error('provider unavailable')
      },
    })

    expect(getIsInjected()).toBe(false)
    expect(getInjectedProvider()).toBeUndefined()
  })
})
