const BOOT_FEATURE_FLAGS_KEY = 'cowSwap.bootFeatureFlags'

describe('featureFlags boot flag', () => {
  beforeEach(() => {
    localStorage.clear()
    delete (window as { __COWSWAP_E2E_FEATURE_FLAGS__?: unknown }).__COWSWAP_E2E_FEATURE_FLAGS__
    jest.resetModules()
  })

  describe('IS_SOLANA_ENABLED', () => {
    it('defaults to false when nothing is persisted', () => {
      const { IS_SOLANA_ENABLED } = require('./featureFlags')

      expect(IS_SOLANA_ENABLED).toBe(false)
    })

    it('reads the value persisted by syncBootFeatureFlags on a previous page load', () => {
      localStorage.setItem(BOOT_FEATURE_FLAGS_KEY, JSON.stringify({ isSolanaEnabled: true }))

      const { IS_SOLANA_ENABLED } = require('./featureFlags')

      expect(IS_SOLANA_ENABLED).toBe(true)
    })

    it('prefers the e2e override over the persisted value', () => {
      localStorage.setItem(BOOT_FEATURE_FLAGS_KEY, JSON.stringify({ isSolanaEnabled: true }))
      ;(window as { __COWSWAP_E2E_FEATURE_FLAGS__?: unknown }).__COWSWAP_E2E_FEATURE_FLAGS__ = {
        isSolanaEnabled: false,
      }

      const { IS_SOLANA_ENABLED } = require('./featureFlags')

      expect(IS_SOLANA_ENABLED).toBe(false)
    })

    it('falls back to false when the persisted value is malformed', () => {
      localStorage.setItem(BOOT_FEATURE_FLAGS_KEY, 'not-json')

      const { IS_SOLANA_ENABLED } = require('./featureFlags')

      expect(IS_SOLANA_ENABLED).toBe(false)
    })
  })

  describe('syncBootFeatureFlags', () => {
    it('persists the resolved isSolanaEnabled flag as a boolean', () => {
      const { syncBootFeatureFlags } = require('./featureFlags')
      syncBootFeatureFlags({ isSolanaEnabled: true }, jest.fn())

      expect(JSON.parse(localStorage.getItem(BOOT_FEATURE_FLAGS_KEY) as string)).toEqual({
        isSolanaEnabled: true,
      })
    })

    it('coerces a missing flag to false', () => {
      const { syncBootFeatureFlags } = require('./featureFlags')
      syncBootFeatureFlags({}, jest.fn())

      expect(JSON.parse(localStorage.getItem(BOOT_FEATURE_FLAGS_KEY) as string)).toEqual({
        isSolanaEnabled: false,
      })
    })

    it('reloads the page when the resolved value differs from the one this page booted with', () => {
      // Nothing persisted yet, so this page booted with IS_SOLANA_ENABLED === false.
      const reload = jest.fn()

      const { syncBootFeatureFlags } = require('./featureFlags')
      syncBootFeatureFlags({ isSolanaEnabled: true }, reload)

      expect(reload).toHaveBeenCalledTimes(1)
    })

    it('does not reload when the resolved value matches the one this page booted with', () => {
      // Nothing persisted yet, so this page booted with IS_SOLANA_ENABLED === false.
      const reload = jest.fn()

      const { syncBootFeatureFlags } = require('./featureFlags')
      syncBootFeatureFlags({ isSolanaEnabled: false }, reload)

      expect(reload).not.toHaveBeenCalled()
    })
  })
})
