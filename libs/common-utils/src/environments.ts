import { getConfiguredEnvironmentNameFromEnvVars } from './env'
import { registerOnWindow } from './misc'

export type EnvironmentName = 'local' | 'development' | 'pr' | 'staging' | 'production' | 'ens'
export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'staging', 'production', 'ens']

const ENVIRONMENT_VAR_NAMES = ['REACT_APP_ENVIRONMENT'] as const

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

const configuredEnvironmentName = getConfiguredEnvironmentNameFromEnvVars(ENVIRONMENT_VAR_NAMES, ALL_ENVIRONMENTS)

export function checkEnvironment(): EnvironmentChecks {
  return getEnvironmentChecks(configuredEnvironmentName)
}

let isLocal = false
let isDev = false
let isPr = false
let isStaging = false
let isProd = false
let isEns = false

const envChecks = checkEnvironment()
isLocal = envChecks.isLocal
isDev = envChecks.isDev
isPr = envChecks.isPr
isStaging = envChecks.isStaging
isProd = envChecks.isProd
isEns = envChecks.isEns

// A hack to test against prod API
const forceProdApi = typeof window !== 'undefined' && !!window.localStorage.getItem('forceProdApi')
const forceStagingApi = typeof window !== 'undefined' && !!window.localStorage.getItem('forceStagingApi')

if (forceProdApi || forceStagingApi) {
  console.debug('[BackendApiOverwrite]', `forceProdApi: ${forceProdApi}, forceStagingApi: ${forceStagingApi}`)
  isProd = forceProdApi
  isStaging = forceStagingApi
}

function getEnvironmentName(): EnvironmentName {
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
    return configuredEnvironmentName
  }
}

export const environmentName: EnvironmentName = getEnvironmentName()

const isProdLike = isProd || isEns || isStaging
const isBarnBackendEnv = forceProdApi ? false : isLocal || isDev || isPr || forceStagingApi

registerOnWindow({ environment: environmentName })

export { isLocal, isDev, isPr, isStaging, isProd, isEns, isProdLike, isBarnBackendEnv }
