export type EnvironmentName = 'local' | 'development' | 'pr' | 'production'
export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'production']

const ENVIRONMENT_VAR_NAME = 'NEXT_PUBLIC_ENVIRONMENT'

// TODO: Remove. Replaced by the `NEXT_PUBLIC_ENVIRONMENT` envvar.
//  Once the envvars are correctly set up, the regexes will no longer be
//  needed to determine the environment
const DEFAULT_ENVIRONMENTS_REGEX: Record<EnvironmentName, string> = {
  local: '^(:?localhost:\\d{2,5}|(?:127|192)(?:\\.[0-9]{1,3}){3})',
  pr: '^cowfi-git-[\\w\\d-]+cowswap\\.vercel\\.app',
  development: '^develop.cow.fi$',
  production: '^cow.fi$',
}

function getRegex(env: EnvironmentName): RegExp {
  let regex
  switch (env) {
    case 'local':
      regex = process.env.REACT_APP_DOMAIN_REGEX_LOCAL
      break
    case 'development':
      regex = process.env.REACT_APP_DOMAIN_REGEX_DEVELOPMENT
      break
    case 'pr':
      regex = process.env.REACT_APP_DOMAIN_REGEX_PR
      break
    case 'production':
      regex = process.env.REACT_APP_DOMAIN_REGEX_PRODUCTION
      break
  }

  return new RegExp(regex || DEFAULT_ENVIRONMENTS_REGEX[env], 'i')
}

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

export function checkEnvironment(host: string): EnvironmentChecks {
  const configuredEnvironmentName = getConfiguredEnvironmentName()

  if (configuredEnvironmentName) {
    return getEnvironmentChecks(configuredEnvironmentName)
  }

  return {
    isLocal: getRegex('local').test(host),
    isDev: getRegex('development').test(host),
    isPr: getRegex('pr').test(host),
    isProd: getRegex('production').test(host),
  }
}

const { isLocal, isDev, isPr, isProd } = checkEnvironmentUsingWindow()

function checkEnvironmentUsingWindow(): EnvironmentChecks {
  const host = typeof window !== 'undefined' ? window.location.host : ''
  return checkEnvironment(host)
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
