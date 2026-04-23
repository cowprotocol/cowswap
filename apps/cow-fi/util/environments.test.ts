import { checkEnvironment, EnvironmentChecks } from './environment'

const DEFAULT_ENVIRONMENTS_CHECKS: EnvironmentChecks = {
  isProd: false,
  isPr: false,
  isDev: false,
  isLocal: false,
}

describe('Detect environments using host and path', () => {
  describe('Not a known environment', () => {
    it('Empty strings', () => {
      expect(checkEnvironment('', '')).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
    it('Unknown domain', () => {
      expect(checkEnvironment('github.com', '')).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })

    it('swap.cow.fi', () => {
      expect(checkEnvironment('swap.cow.fi', '')).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
  })

  describe('Is production', () => {
    const isProduction = { ...DEFAULT_ENVIRONMENTS_CHECKS, isProd: true }

    it('cow.fi', () => {
      expect(checkEnvironment('cow.fi', '')).toEqual(isProduction)
    })
  })

  describe('Is PR', () => {
    const isPr = { ...DEFAULT_ENVIRONMENTS_CHECKS, isPr: true }

    it('https://cowfi-git-widget-page-1-cowswap.vercel.app', () => {
      expect(checkEnvironment('cowfi-git-widget-page-1-cowswap.vercel.app', '')).toEqual(isPr)
    })

    it('https://cowfi-git-add-env-test-and-widget-cowswap.vercel.app', () => {
      expect(checkEnvironment('cowfi-git-add-env-test-and-widget-cowswap.vercel.app', '')).toEqual(isPr)
    })
  })

  describe('Is Development', () => {
    const isDevelopment = { ...DEFAULT_ENVIRONMENTS_CHECKS, isDev: true }

    it('develop.cow.fi', () => {
      expect(checkEnvironment('develop.cow.fi', '')).toEqual(isDevelopment)
    })
  })

  describe('Is Local', () => {
    const isLocal = { ...DEFAULT_ENVIRONMENTS_CHECKS, isLocal: true }

    it('localhost:3000', () => {
      expect(checkEnvironment('localhost:3000', '')).toEqual(isLocal)
    })

    it('localhost:8080', () => {
      expect(checkEnvironment('localhost:8080', '')).toEqual(isLocal)
    })

    it('127.0.0.1:3000', () => {
      expect(checkEnvironment('127.0.0.1:3000', '')).toEqual(isLocal)
    })

    it('192.168.0.11:3000', () => {
      expect(checkEnvironment('192.168.0.11:3000', '')).toEqual(isLocal)
    })
  })
})
