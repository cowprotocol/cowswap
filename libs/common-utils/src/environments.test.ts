import { checkEnvironment, EnvironmentChecks } from './environments'

const DEFAULT_ENVIRONMENTS_CHECKS: EnvironmentChecks = {
  isProd: false,
  isEns: false,
  isStaging: false,
  isPr: false,
  isDev: false,
  isLocal: false,
}

// TODO: Break down this large function into smaller functions

describe('Detect environments using configured env var', () => {
  const ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'
  const originalEnvironment = process.env[ENVIRONMENT_VAR_NAME]

  afterAll(() => {
    if (typeof originalEnvironment === 'undefined') {
      delete process.env[ENVIRONMENT_VAR_NAME]
    } else {
      process.env[ENVIRONMENT_VAR_NAME] = originalEnvironment
    }
  })

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

  describe('Is ENS', () => {
    const isEns = { ...DEFAULT_ENVIRONMENTS_CHECKS, isEns: true }

    it('uses env var override', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'ens'

      expect(checkEnvironment()).toEqual(isEns)
    })
  })

  describe('Is Staging', () => {
    const isStaging = { ...DEFAULT_ENVIRONMENTS_CHECKS, isStaging: true }

    it('uses env var override', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'staging'

      expect(checkEnvironment()).toEqual(isStaging)
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
