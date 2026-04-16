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

const getRegex = (regex: string | undefined): RegExp | undefined => (regex ? new RegExp(regex) : undefined)

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

export function checkEnvironment(host: string): EnvsFlags {
  const configuredEnvironmentName = getConfiguredEnvironmentName()

  if (configuredEnvironmentName) {
    return getEnvironmentChecks(configuredEnvironmentName)
  }

  // TODO: Remove regex checks and rely solely on the configured environment variable once all environments are updated
  const domainDevRegex = getRegex(process.env.EXPLORER_APP_DOMAIN_REGEX_DEV)
  const domainStagingRegex = getRegex(process.env.EXPLORER_APP_DOMAIN_REGEX_STAGING)
  const domainProdRegex = getRegex(process.env.EXPLORER_APP_DOMAIN_REGEX_PROD)

  return {
    isLocal: false,
    isDev: domainDevRegex?.test(host) || false,
    isPr: false,
    isStaging: domainStagingRegex?.test(host) || false,
    isProd: domainProdRegex?.test(host) || false,
  }
}

const { isLocal, isDev, isPr, isStaging, isProd } = checkEnvironment(
  typeof window !== 'undefined' ? window.location.host : '',
)

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
