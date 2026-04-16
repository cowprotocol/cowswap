describe('explorer env detection', () => {
  const ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'
  const originalEnvironment = process.env[ENVIRONMENT_VAR_NAME]

  afterEach(() => {
    jest.resetModules()

    if (typeof originalEnvironment === 'undefined') {
      delete process.env[ENVIRONMENT_VAR_NAME]
    } else {
      process.env[ENVIRONMENT_VAR_NAME] = originalEnvironment
    }
  })

  it('uses the configured environment name', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'production'

    const { environmentName, checkEnvironment } = await import('../../utils/env')

    expect(environmentName).toBe('production')
    expect(checkEnvironment()).toEqual({
      isLocal: false,
      isDev: false,
      isPr: false,
      isStaging: false,
      isProd: true,
    })
  })

  it('supports pr as an explicit environment', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'pr'

    const { environmentName, checkEnvironment } = await import('../../utils/env')

    expect(environmentName).toBe('pr')
    expect(checkEnvironment()).toEqual({
      isLocal: false,
      isDev: false,
      isPr: true,
      isStaging: false,
      isProd: false,
    })
  })

  it('falls back when the configured environment is invalid', async () => {
    process.env[ENVIRONMENT_VAR_NAME] = 'invalid-environment'

    const { environmentName, checkEnvironment } = await import('../../utils/env')

    expect(environmentName).toBeUndefined()
    expect(checkEnvironment()).toEqual({
      isLocal: false,
      isDev: false,
      isPr: false,
      isStaging: false,
      isProd: false,
    })
  })
})
