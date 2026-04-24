import { getConfiguredEnvironmentNameFromEnvVars } from '@cowprotocol/common-utils'

type EnvsFlags = {
  isLocal: boolean
  isDev: boolean
  isPr: boolean
  isStaging: boolean
  isProd: boolean
}

export type Envs = 'local' | 'production' | 'staging' | 'development' | 'pr'
const ALL_ENVIRONMENTS: Envs[] = ['local', 'development', 'pr', 'staging', 'production']
const ENVIRONMENT_VAR_NAMES = ['REACT_APP_ENVIRONMENT'] as const

function getConfiguredEnvironmentName(): Envs {
  return getConfiguredEnvironmentNameFromEnvVars(ENVIRONMENT_VAR_NAMES, ALL_ENVIRONMENTS)
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
