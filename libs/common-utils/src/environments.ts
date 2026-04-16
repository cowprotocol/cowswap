import { registerOnWindow } from './misc'

export type EnvironmentName = 'local' | 'development' | 'pr' | 'staging' | 'production' | 'ens'
export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'staging', 'production', 'ens']

const ENVIRONMENT_VAR_NAME = 'REACT_APP_ENVIRONMENT'

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

function getDefaultEnvironmentChecks(): EnvironmentChecks {
  return {
    isLocal: false,
    isDev: false,
    isPr: false,
    isStaging: false,
    isProd: false,
    isEns: false,
  }
}

export function checkEnvironment(): EnvironmentChecks {
  const configuredEnvironmentName = getConfiguredEnvironmentName()
  if (configuredEnvironmentName) {
    return getEnvironmentChecks(configuredEnvironmentName)
  }

  return getDefaultEnvironmentChecks()
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
  const envChecks = checkEnvironment()
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
