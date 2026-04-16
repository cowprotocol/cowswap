export type EnvironmentName = 'local' | 'development' | 'pr' | 'production'
export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'production']

const ENVIRONMENT_VAR_NAME = 'NEXT_PUBLIC_ENVIRONMENT'

function isEnvironmentName(value: string): value is EnvironmentName {
  return ALL_ENVIRONMENTS.includes(value as EnvironmentName)
}

function getConfiguredEnvironmentName(): EnvironmentName | undefined {
  const env = process.env[ENVIRONMENT_VAR_NAME]?.trim().toLowerCase()

  if (!env) {
    return undefined
  }

  if (!isEnvironmentName(env)) {
    return undefined
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

function getDefaultEnvironmentChecks(): EnvironmentChecks {
  return {
    isLocal: false,
    isDev: false,
    isPr: false,
    isProd: false,
  }
}

export function checkEnvironment(): EnvironmentChecks {
  const configuredEnvironmentName = getConfiguredEnvironmentName()

  if (configuredEnvironmentName) {
    return getEnvironmentChecks(configuredEnvironmentName)
  }

  return getDefaultEnvironmentChecks()
}

const { isLocal, isDev, isPr, isProd } = checkEnvironmentUsingWindow()

function checkEnvironmentUsingWindow(): EnvironmentChecks {
  return checkEnvironment()
}

function getEnvironmentName(): EnvironmentName | undefined {
  if (isProd) {
    return 'production'
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

export const environmentName: EnvironmentName | undefined = getEnvironmentName()

export { isLocal, isDev, isPr, isProd }
