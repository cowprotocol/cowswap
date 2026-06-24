import { shouldCheckCapabilities } from './useWalletCapabilities.utils'

const desktopEnvironment = {
  isInjectedMobileBrowser: false,
  isInjectedWidget: false,
  isMobile: false,
}

const mobileEnvironment = {
  ...desktopEnvironment,
  isMobile: true,
}

describe('shouldCheckCapabilities', () => {
  it('checks capabilities for desktop injected wallets', () => {
    expect(shouldCheckCapabilities(false, { isLoading: false }, desktopEnvironment)).toBe(true)
  })

  it('skips capabilities for injected mobile browsers', () => {
    expect(
      shouldCheckCapabilities(false, { isLoading: false }, { ...mobileEnvironment, isInjectedMobileBrowser: true }),
    ).toBe(false)
  })

  it('skips capabilities for WalletConnect sessions', () => {
    expect(shouldCheckCapabilities(true, { isLoading: false }, desktopEnvironment)).toBe(false)
    expect(shouldCheckCapabilities(true, { isLoading: false }, mobileEnvironment)).toBe(false)
  })

  it('treats null widget metadata as regular injected wallet metadata', () => {
    expect(shouldCheckCapabilities(false, { data: null, isLoading: false }, desktopEnvironment)).toBe(true)
  })

  it('skips capabilities for widget-derived WalletConnect sessions', () => {
    expect(
      shouldCheckCapabilities(
        false,
        { data: { providerWcMetadata: {} }, isLoading: false },
        { ...desktopEnvironment, isInjectedWidget: true },
      ),
    ).toBe(false)
  })

  it('waits for widget provider metadata before deciding on mobile', () => {
    expect(shouldCheckCapabilities(false, { isLoading: true }, { ...mobileEnvironment, isInjectedWidget: true })).toBe(
      false,
    )
  })
})
