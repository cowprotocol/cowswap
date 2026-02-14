import { isIosExternalBrowser } from './isIosExternalBrowser'

// Mock `@cowprotocol/common-utils` — the module exports runtime-computed values
jest.mock('@cowprotocol/common-utils', () => ({
  isMobile: false,
  userAgent: {},
  isCoinbaseWalletBrowser: false,
}))

const commonUtils = require('@cowprotocol/common-utils') as {
  isMobile: boolean
  userAgent: { os?: { name?: string } }
  isCoinbaseWalletBrowser: boolean
}

function setEnv(overrides: { isMobile?: boolean; osName?: string; isCoinbaseWalletBrowser?: boolean }): void {
  commonUtils.isMobile = overrides.isMobile ?? false
  commonUtils.userAgent = { os: { name: overrides.osName } }
  commonUtils.isCoinbaseWalletBrowser = overrides.isCoinbaseWalletBrowser ?? false
}

describe('isIosExternalBrowser', () => {
  afterEach(() => {
    setEnv({})
  })

  it('returns true on iOS Safari (mobile + iOS + not Coinbase browser)', () => {
    setEnv({ isMobile: true, osName: 'iOS', isCoinbaseWalletBrowser: false })
    expect(isIosExternalBrowser()).toBe(true)
  })

  it('returns false inside the Coinbase in-app browser', () => {
    setEnv({ isMobile: true, osName: 'iOS', isCoinbaseWalletBrowser: true })
    expect(isIosExternalBrowser()).toBe(false)
  })

  it('returns false on Android', () => {
    setEnv({ isMobile: true, osName: 'Android' })
    expect(isIosExternalBrowser()).toBe(false)
  })

  it('returns false on desktop', () => {
    setEnv({ isMobile: false, osName: 'Windows' })
    expect(isIosExternalBrowser()).toBe(false)
  })

  it('returns false on desktop iOS (e.g. iPad in desktop mode)', () => {
    setEnv({ isMobile: false, osName: 'iOS' })
    expect(isIosExternalBrowser()).toBe(false)
  })
})
