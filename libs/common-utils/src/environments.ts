import { registerOnWindow } from './misc'

export type EnvironmentName = 'local' | 'development' | 'pr' | 'staging' | 'production' | 'ens'
export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'staging', 'production', 'ens']

const ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'

// TODO: Remove regex checks and rely solely on the configured environment variable once all environments are updated
const DEFAULT_ENVIRONMENTS_REGEX: Record<EnvironmentName, string> = {
  local: '^(:?localhost:\\d{2,5}|(?:127|192)(?:\\.[0-9]{1,3}){3})',
  pr: '^((?:explorer|swap)-dev-git-[\\w\\d-]+|swap-\\w{9}-)cowswap-dev\\.vercel\\.app',
  development: '^(dev.swap.cow.fi|dev.explorer.cow.fi|swap-develop.vercel.app|explorer-dev.vercel.app)',
  staging: '^(staging.swap.cow.fi|staging.explorer.cow.fi|swap-staging.vercel.app|explorer-staging.vercel.app)',
  production:
    '^(swap.cow.fi|explorer.cow.fi|swap-prod.vercel.app|explorer-prod-seven.vercel.app|cow.trade|cowswap.exchange)$',
  ens: '(:?^cowswap.eth|ipfs)',
}

function getRegex(env: EnvironmentName): RegExp {
  const regex = process.env[`REACT_APP_DOMAIN_REGEX_${env.toUpperCase()}`] || DEFAULT_ENVIRONMENTS_REGEX[env]
  return new RegExp(regex, 'i')
}

function isEnvironmentName(value: string): value is EnvironmentName {
  return ALL_ENVIRONMENTS.includes(value as EnvironmentName)
}

function getConfiguredEnvironmentName(): EnvironmentName | undefined {
  const env = process.env[ENVIRONMENT_VAR_NAME]?.trim().toLowerCase()

  if (!env) {
    return undefined
  }

  return isEnvironmentName(env) ? env : undefined
}

export interface EnvironmentChecks {
  isProd: boolean
  isEns: boolean
  isStaging: boolean
  isPr: boolean
  isDev: boolean
  isLocal: boolean
}

function getEnvironmentChecks(environmentName: EnvironmentName): EnvironmentChecks {
  return {
    isLocal: environmentName === 'local',
    isDev: environmentName === 'development',
    isPr: environmentName === 'pr',
    isStaging: environmentName === 'staging',
    isProd: environmentName === 'production',
    isEns: environmentName === 'ens',
  }
}

export function checkEnvironment(host: string, path: string): EnvironmentChecks {
  const configuredEnvironmentName = getConfiguredEnvironmentName()
  if (configuredEnvironmentName) {
    return getEnvironmentChecks(configuredEnvironmentName)
  }

  const ensRegex = getRegex('ens')

  return {
    // Project environments
    isLocal: getRegex('local').test(host),
    isDev: getRegex('development').test(host),
    isPr: getRegex('pr').test(host),
    isStaging: getRegex('staging').test(host),
    isProd: getRegex('production').test(host),
    isEns: ensRegex.test(host) || ensRegex.test(path),
  }
}

// A hack to test against prod API
const forceProdApi = typeof window !== 'undefined' && !!window.localStorage.getItem('forceProdApi')
const forceStagingApi = typeof window !== 'undefined' && !!window.localStorage.getItem('forceStagingApi')

if (forceProdApi || forceStagingApi) {
  console.debug('[BackendApiOverwrite]', `forceProdApi: ${forceProdApi}, forceStagingApi: ${forceStagingApi}`)
}

// Default values for environments
let isLocal = false
let isDev = false
let isPr = false
let isStaging = forceStagingApi
let isProd = forceProdApi
let isEns = false

if (typeof window !== 'undefined') {
  const envChecks = checkEnvironment(window.location.host, window.location.pathname)
  isLocal = envChecks.isLocal
  isDev = envChecks.isDev
  isPr = envChecks.isPr
  isStaging = envChecks.isStaging
  isProd = envChecks.isProd
  isEns = envChecks.isEns
}

function getEnvironmentName(): EnvironmentName | undefined {
  if (isProd) {
    return 'production'
  } else if (isEns) {
    return 'ens'
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

export const environmentName: EnvironmentName | undefined = getEnvironmentName()

const isProdLike = isProd || isEns || isStaging
const isBarnBackendEnv = forceProdApi ? false : isLocal || isDev || isPr || forceStagingApi

registerOnWindow({ environment: environmentName })

export { isLocal, isDev, isPr, isStaging, isProd, isEns, isProdLike, isBarnBackendEnv }
