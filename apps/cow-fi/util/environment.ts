export type EnvironmentName = 'local' | 'development' | 'pr' | 'production'
export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'production']

const ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'

function isEnvironmentName(value: string): value is EnvironmentName {
  return ALL_ENVIRONMENTS.includes(value as EnvironmentName)
}

function getConfiguredEnvironmentName(): EnvironmentName {
  const env = process.env[ENVIRONMENT_VAR_NAME]?.trim().toLowerCase()

  if (!env) {
    throw new Error(`Missing ${ENVIRONMENT_VAR_NAME}. Expected one of: ${ALL_ENVIRONMENTS.join(', ')}`)
  }

  if (!isEnvironmentName(env)) {
    throw new Error(`Invalid ${ENVIRONMENT_VAR_NAME}="${env}". Expected one of: ${ALL_ENVIRONMENTS.join(', ')}`)
  }

  return env
}

export interface EnvironmentChecks {
  isProd: boolean
  isPr: boolean
  isDev: boolean
  isLocal: boolean
}

function getEnvironmentChecks(environmentName: EnvironmentName): EnvironmentChecks {
  return {
    isLocal: environmentName === 'local',
    isDev: environmentName === 'development',
    isPr: environmentName === 'pr',
    isProd: environmentName === 'production',
  }
}

const configuredEnvironmentName = getConfiguredEnvironmentName()

export function checkEnvironment(): EnvironmentChecks {
  return getEnvironmentChecks(configuredEnvironmentName)
}

const { isLocal, isDev, isPr, isProd } = checkEnvironmentUsingWindow()

function checkEnvironmentUsingWindow(): EnvironmentChecks {
  return checkEnvironment()
}

function getEnvironmentName(): EnvironmentName {
  if (isProd) {
    return 'production'
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

export const environmentName: EnvironmentName = getEnvironmentName()

export { isLocal, isDev, isPr, isProd }
