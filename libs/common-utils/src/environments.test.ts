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

describe('Detect environments using host and path', () => {
  const ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'
  const ENV_REGEX_KEYS = [
    'REACT_APP_DOMAIN_REGEX_LOCAL',
    'REACT_APP_DOMAIN_REGEX_PR',
    'REACT_APP_DOMAIN_REGEX_DEVELOPMENT',
    'REACT_APP_DOMAIN_REGEX_STAGING',
    'REACT_APP_DOMAIN_REGEX_PRODUCTION',
    'REACT_APP_DOMAIN_REGEX_BARN',
    'REACT_APP_DOMAIN_REGEX_ENS',
  ] as const

  const originalEnvRegexValues: Partial<Record<(typeof ENV_REGEX_KEYS)[number], string | undefined>> = {}
  const originalEnvironment = process.env[ENVIRONMENT_VAR_NAME]

  beforeAll(() => {
    ENV_REGEX_KEYS.forEach((key) => {
      originalEnvRegexValues[key] = process.env[key]
      delete process.env[key]
    })
  })

  afterAll(() => {
    if (typeof originalEnvironment === 'undefined') {
      delete process.env[ENVIRONMENT_VAR_NAME]
    } else {
      process.env[ENVIRONMENT_VAR_NAME] = originalEnvironment
    }

    ENV_REGEX_KEYS.forEach((key) => {
      const originalValue = originalEnvRegexValues[key]
      if (typeof originalValue === 'undefined') {
        delete process.env[key]
      } else {
        process.env[key] = originalValue
      }
    })
  })

  afterEach(() => {
    if (typeof originalEnvironment === 'undefined') {
      delete process.env[ENVIRONMENT_VAR_NAME]
    } else {
      process.env[ENVIRONMENT_VAR_NAME] = originalEnvironment
    }
  })

  describe('Not a known environment', () => {
    it('Empty strings', () => {
      expect(checkEnvironment('', '')).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
    it('Unknown domain', () => {
      expect(checkEnvironment('github.com', '')).toEqual(DEFAULT_ENVIRONMENTS_CHECKS)
    })
  })

  describe('Is production', () => {
    const isProduction = { ...DEFAULT_ENVIRONMENTS_CHECKS, isProd: true }

    it('swap.cow.fi', () => {
      expect(checkEnvironment('swap.cow.fi', '')).toEqual(isProduction)
    })

    it('uses env var override', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'production'

      expect(checkEnvironment('localhost:3000', '')).toEqual(isProduction)
    })
  })

  describe('Is ENS', () => {
    const isEns = { ...DEFAULT_ENVIRONMENTS_CHECKS, isEns: true }

    it('cowswap.eth', () => {
      expect(checkEnvironment('cowswap.eth', '')).toEqual(isEns)
    })

    it('cowswap.eth.link', () => {
      expect(checkEnvironment('cowswap.eth.link', '')).toEqual(isEns)
    })

    it('<CID>.ipfs.dweb.link', () => {
      expect(
        checkEnvironment('bafybeiff3lt2cfhrxvv3tm77s5qvaoaksxfrrblcclnvkxbf56oxqapjuq.ipfs.dweb.link', ''),
      ).toEqual(isEns)
    })

    it('ipfs.io/ipfs/<HASH>', () => {
      expect(checkEnvironment('ipfs.io', '/ipfs/whatever')).toEqual(isEns)
    })

    it('gateway.pinata.cloud/ipfs/<HASH>', () => {
      expect(checkEnvironment('gateway.pinata.cloud', '/ipfs/QmZW5abzempvhyPvSMbLhnmZ6d6SEGgGQd3paaHRK7CSfm')).toEqual(
        isEns,
      )
    })
  })

  describe('Is Staging', () => {
    const isStaging = { ...DEFAULT_ENVIRONMENTS_CHECKS, isStaging: true }

    it('staging.swap.cow.fi', () => {
      expect(checkEnvironment('staging.swap.cow.fi', '')).toEqual(isStaging)
    })
  })

  describe('Is PR', () => {
    const isPr = { ...DEFAULT_ENVIRONMENTS_CHECKS, isPr: true }

    it('pr<NUMBER>--cowswap.review.gnosisdev.com', () => {
      expect(checkEnvironment('swap-dev-git-improve-quote-updater-cowswap-dev.vercel.app', '')).toEqual(isPr)
    })
  })

  describe('Is Development', () => {
    const isDevelopment = { ...DEFAULT_ENVIRONMENTS_CHECKS, isDev: true }

    it('dev.swap.cow.fi', () => {
      expect(checkEnvironment('dev.swap.cow.fi', '')).toEqual(isDevelopment)
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

    it('falls back to host matching when env var is invalid', () => {
      process.env[ENVIRONMENT_VAR_NAME] = 'invalid-environment'

      expect(checkEnvironment('localhost:3000', '')).toEqual(isLocal)
    })
  })
})
