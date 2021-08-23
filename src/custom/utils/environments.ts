import { registerOnWindow } from './misc'

const getRegex = (regex: string | undefined) => (regex ? new RegExp(regex, 'i') : undefined)

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
  // Domain regex
  const domainLocalRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_LOCAL)
  const domainPrRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_PR)
  const domainDevRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_DEV)
  const domainStagingRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_STAGING)
  const domainProdRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_PROD)
  const domainEnsRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_ENS)
  const domainBarnRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_BARN)

  // Path regex
  const pathEnsRegex = getRegex(process.env.REACT_APP_PATH_REGEX_ENS)

  return {
    // Project environments
    isLocal: domainLocalRegex?.test(host) || false,
    isDev: domainDevRegex?.test(host) || false,
    isPr: domainPrRegex?.test(host) || false,
    isStaging: domainStagingRegex?.test(host) || false,
    isProd: domainProdRegex?.test(host) || false,
    isEns: domainEnsRegex?.test(host) || pathEnsRegex?.test(path) || false,

    // Environment used for Backend workflow
    //  Latest stable version pointing to the DEV api
    isBarn: domainBarnRegex?.test(host) || false,
  }
}

const { isLocal, isDev, isPr, isStaging, isProd, isEns, isBarn } = checkEnvironment(
  window.location.host,
  window.location.pathname
)

export const environmentName = (function () {
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

registerOnWindow({ environment: environmentName })

export { isLocal, isDev, isPr, isBarn, isStaging, isProd, isEns }
