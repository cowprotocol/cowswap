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

function getConfiguredEnvironmentName(): Envs {
  const env = process.env[EXPLORER_ENVIRONMENT_VAR_NAME]?.trim().toLowerCase()

  if (!env) {
    throw new Error(`Missing ${EXPLORER_ENVIRONMENT_VAR_NAME}. Expected one of: ${ALL_ENVIRONMENTS.join(', ')}`)
  }

  if (!isEnvironmentName(env)) {
    throw new Error(
      `Invalid ${EXPLORER_ENVIRONMENT_VAR_NAME}="${env}". Expected one of: ${ALL_ENVIRONMENTS.join(', ')}`,
    )
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

const configuredEnvironmentName = getConfiguredEnvironmentName()

export function checkEnvironment(): EnvsFlags {
  return getEnvironmentChecks(configuredEnvironmentName)
}

const { isLocal, isDev, isPr, isStaging, isProd } = checkEnvironment()

function getEnvironmentName(): Envs {
  if (isProd) {
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
    return configuredEnvironmentName
  }
}

export const environmentName: Envs = getEnvironmentName()

export { isLocal, isDev, isPr, isStaging, isProd }
