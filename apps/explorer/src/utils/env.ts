type EnvsFlags = {
  isLocal: boolean
  isDev: boolean
  isPr: boolean
  isStaging: boolean
  isProd: boolean
}

export type Envs = 'local' | 'production' | 'staging' | 'development' | 'pr'

const EXPLORER_ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'
const ALL_ENVIRONMENTS: Envs[] = ['local', 'development', 'pr', 'staging', 'production']

function isEnvironmentName(value: string): value is Envs {
  return ALL_ENVIRONMENTS.includes(value as Envs)
}

function getConfiguredEnvironmentName(): Envs | undefined {
  const env = process.env[EXPLORER_ENVIRONMENT_VAR_NAME]?.trim().toLowerCase()

  if (!env) {
    return undefined
  }

  if (!isEnvironmentName(env)) {
    return undefined
  }

  return env
}

function getEnvironmentChecks(environmentName: Envs): EnvsFlags {
  return {
    isLocal: environmentName === 'local',
    isDev: environmentName === 'development',
    isPr: environmentName === 'pr',
    isStaging: environmentName === 'staging',
    isProd: environmentName === 'production',
  }
}

function getDefaultEnvironmentChecks(): EnvsFlags {
  return {
    isLocal: false,
    isDev: false,
    isPr: false,
    isStaging: false,
    isProd: false,
  }
}

export function checkEnvironment(): EnvsFlags {
  const configuredEnvironmentName = getConfiguredEnvironmentName()

  if (configuredEnvironmentName) {
    return getEnvironmentChecks(configuredEnvironmentName)
  }

  return getDefaultEnvironmentChecks()
}

const { isLocal, isDev, isPr, isStaging, isProd } = checkEnvironment()

function getEnvironmentName(): Envs | undefined {
  const configuredEnvironmentName = getConfiguredEnvironmentName()

  if (configuredEnvironmentName) {
    return configuredEnvironmentName
  } else if (isProd) {
    return 'production'
  } else if (isStaging) {
    return 'staging'
  } else if (isPr) {
    return 'pr'
  } else if (isDev) {
    return 'development'
  } else if (isLocal) {
    return 'local'
  } else {
    return undefined
  }
}

export const environmentName: Envs | undefined = getEnvironmentName()

export { isLocal, isDev, isPr, isStaging, isProd }
