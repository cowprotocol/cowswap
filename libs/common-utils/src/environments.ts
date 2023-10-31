import { registerOnWindow } from './misc'

const DEFAULT_ENVIRONMENTS_REGEX: Record<Envs, string> = {
  LOCAL: '^(:?localhost:\\d{2,5}|(?:127|192)(?:\\.[0-9]{1,3}){3})',
  PR: '^pr\\d+--cowswap\\.review|^(swap-dev-git-[\\w\\d-]+|swap-\\w{9}-)cowswap\\.vercel\\.app',
  DEV: '^(dev.swap.cow.fi|swap-develop.vercel.app)',
  STAGING: '^(staging.swap.cow.fi|swap-staging.vercel.app)',
  PROD: '^(swap.cow.fi|swap-prod.vercel.app)$',
  BARN: '^(barn.cow.fi|swap-barn.vercel.app)$',
  ENS: '(:?^cowswap.eth|ipfs)',
}

function getRegex(env: Envs) {
  const regex = process.env[`REACT_APP_DOMAIN_REGEX_${env}`] || DEFAULT_ENVIRONMENTS_REGEX[env]
  return new RegExp(regex, 'i')
}

type Envs = 'LOCAL' | 'PR' | 'DEV' | 'STAGING' | 'PROD' | 'BARN' | 'ENS'
export interface EnvironmentChecks {
  isProd: boolean
  isEns: boolean
  isBarn: boolean
  isStaging: boolean
  isPr: boolean
  isDev: boolean
  isLocal: boolean
}

export function checkEnvironment(host: string, path: string): EnvironmentChecks {
  const ensRegex = getRegex('ENS')

  return {
    // Project environments
    isLocal: getRegex('LOCAL').test(host),
    isDev: getRegex('DEV').test(host),
    isPr: getRegex('PR').test(host),
    isStaging: getRegex('STAGING').test(host),
    isProd: getRegex('PROD').test(host),
    isEns: ensRegex.test(host) || ensRegex.test(path),

    // Environment used for Backend workflow
    // The latest stable version pointing to the DEV api
    isBarn: getRegex('BARN').test(host),
  }
}

const { isLocal, isDev, isPr, isStaging, isProd, isEns, isBarn } = checkEnvironment(
  window.location.host,
  window.location.pathname
)

export type EnvironmentName = 'local' | 'development' | 'pr' | 'staging' | 'production' | 'barn' | 'ens'

export const environmentName: EnvironmentName | undefined = (function () {
  if (isProd) {
    return 'production'
  } else if (isBarn) {
    return 'barn'
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
})()

const isProdLike = isProd || isEns || isStaging || isBarn
const isBarnBackendEnv = isLocal || isDev || isPr || isBarn

registerOnWindow({ environment: environmentName })

export { isLocal, isDev, isPr, isBarn, isStaging, isProd, isEns, isProdLike, isBarnBackendEnv }
