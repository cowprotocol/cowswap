import { registerOnWindow } from './misc'

const DEFAULT_ENVIRONMENTS_REGEX: Record<EnvironmentName, string> = {
  local: '^(:?localhost:\\d{2,5}|(?:127|192)(?:\\.[0-9]{1,3}){3})',
  pr: '^(swap-dev-git-[\\w\\d-]+|swap-\\w{9}-)cowswap\\.vercel\\.app',
  development: '^(dev.swap.cow.fi|swap-develop.vercel.app)',
  staging: '^(staging.swap.cow.fi|swap-staging.vercel.app)',
  production: '^(swap.cow.fi|swap-prod.vercel.app)$',
  barn: '^(barn.cow.fi|swap-barn.vercel.app)$',
  ens: '(:?^cowswap.eth|ipfs)',
}

function getRegex(env: EnvironmentName) {
  const regex = process.env[`REACT_APP_DOMAIN_REGEX_${env.toUpperCase()}`] || DEFAULT_ENVIRONMENTS_REGEX[env]
  return new RegExp(regex, 'i')
}
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
  const ensRegex = getRegex('ens')

  return {
    // Project environments
    isLocal: getRegex('local').test(host),
    isDev: getRegex('development').test(host),
    isPr: getRegex('pr').test(host),
    isStaging: getRegex('staging').test(host),
    isProd: getRegex('production').test(host),
    isEns: ensRegex.test(host) || ensRegex.test(path),

    // Environment used for Backend workflow
    // The latest stable version pointing to the DEV api
    isBarn: getRegex('barn').test(host),
  }
}

const { isLocal, isDev, isPr, isStaging, isProd, isEns, isBarn } = checkEnvironment(
  window.location.host,
  window.location.pathname
)

export const ALL_ENVIRONMENTS: EnvironmentName[] = [
  'local',
  'development',
  'pr',
  'staging',
  'production',
  'barn',
  'ens',
]
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
