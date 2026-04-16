import { checkEnvironment, EnvironmentChecks } from './environment'

const DEFAULT_ENVIRONMENTS_CHECKS: EnvironmentChecks = {
  isProd: false,
  isPr: false,
  isDev: false,
  isLocal: false,
}

describe('Detect environments using configured env var', () => {
  const ENVIRONMENT_VAR_NAME = 'NEXT_PUBLIC_ENVIRONMENT'
  const originalEnvironment = process.env[ENVIRONMENT_VAR_NAME]

  afterEach(() => {
    if (typeof originalEnvironment === 'undefined') {
      delete process.env[ENVIRONMENT_VAR_NAME]
    } else {
      process.env[ENVIRONMENT_VAR_NAME] = originalEnvironment
    }
  })

  describe('No configured environment', () => {
    it('returns no active envs', () => {
      expect(checkEnvironment()).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
  })

  describe('Is production', () => {
    const isProduction = { ...DEFAULT_ENVIRONMENTS_CHECKS, isProd: true }

    it('uses env var override', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'production'

      expect(checkEnvironment()).toEqual(isProduction)
    })
  })

  describe('Is PR', () => {
    const isPr = { ...DEFAULT_ENVIRONMENTS_CHECKS, isPr: true }

    it('uses env var override', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'pr'

      expect(checkEnvironment()).toEqual(isPr)
    })
  })

  describe('Is Development', () => {
    const isDevelopment = { ...DEFAULT_ENVIRONMENTS_CHECKS, isDev: true }

    it('uses env var override', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'development'

      expect(checkEnvironment()).toEqual(isDevelopment)
    })
  })

  describe('Is Local', () => {
    const isLocal = { ...DEFAULT_ENVIRONMENTS_CHECKS, isLocal: true }

    it('uses env var override', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'local'

      expect(checkEnvironment()).toEqual(isLocal)
    })

    it('returns no active envs when env var is invalid', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'invalid-environment'

      expect(checkEnvironment()).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
  })
})
