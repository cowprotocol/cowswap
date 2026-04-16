import { registerOnWindow } from './misc'

export type EnvironmentName = 'local' | 'development' | 'pr' | 'staging' | 'production' | 'ens'
export const ALL_ENVIRONMENTS: EnvironmentName[] = ['local', 'development', 'pr', 'staging', 'production', 'ens']

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

const configuredEnvironmentName = getConfiguredEnvironmentName()

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
