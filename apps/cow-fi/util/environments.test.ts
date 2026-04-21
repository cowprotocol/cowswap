const ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'
const originalEnvironment = process.env[ENVIRONMENT_VAR_NAME]

const DEFAULT_ENVIRONMENTS_CHECKS = {
  isProd: false,
  isPr: false,
  isDev: false,
  isLocal: false,
}

describe('Detect environments using configured env var', () => {
  afterEach(() => {
    jest.resetModules()

    if (typeof originalEnvironment === 'undefined') {
      delete process.env[ENVIRONMENT_VAR_NAME]
    } else {
      process.env[ENVIRONMENT_VAR_NAME] = originalEnvironment
    }
  })

  it('throws when the env var is missing', async () => {
    delete process.env[ENVIRONMENT_VAR_NAME]

    await expect(import('./environment')).rejects.toThrow(`Missing ${ENVIRONMENT_VAR_NAME}`)
  })

  it('throws when the env var is invalid', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'invalid-environment'

    await expect(import('./environment')).rejects.toThrow(`Invalid ${ENVIRONMENT_VAR_NAME}="invalid-environment"`)
  })

  it('uses production env var override', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'production'

    const { checkEnvironment, environmentName } = await import('./environment')

    expect(environmentName).toBe('production')
    expect(checkEnvironment()).toEqual({ ...DEFAULT_ENVIRONMENTS_CHECKS, isProd: true })
  })

  it('uses pr env var override', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'pr'

    const { checkEnvironment, environmentName } = await import('./environment')

    expect(environmentName).toBe('pr')
    expect(checkEnvironment()).toEqual({ ...DEFAULT_ENVIRONMENTS_CHECKS, isPr: true })
  })

  it('uses development env var override', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'development'

    const { checkEnvironment, environmentName } = await import('./environment')

    expect(environmentName).toBe('development')
    expect(checkEnvironment()).toEqual({ ...DEFAULT_ENVIRONMENTS_CHECKS, isDev: true })
  })

  it('uses local env var override', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'local'

    const { checkEnvironment, environmentName } = await import('./environment')

    expect(environmentName).toBe('local')
    expect(checkEnvironment()).toEqual({ ...DEFAULT_ENVIRONMENTS_CHECKS, isLocal: true })
  })
})
