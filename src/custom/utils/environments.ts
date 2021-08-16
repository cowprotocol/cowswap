const getRegex = (regex: string | undefined) => (regex ? new RegExp(regex) : undefined)

export function checkEnvironment(host: string) {
  const domainDevRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_DEV)
  const domainStagingRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_STAGING)
  const domainProdRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_PROD)
  const domainEnsRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_ENS)
  const domainPreStagingRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_PRESTAGING)

  return {
    // Project environments
    isDev: domainDevRegex?.test(host) || false,
    isStaging: domainStagingRegex?.test(host) || false,
    isProd: domainProdRegex?.test(host) || false,
    isEns: domainEnsRegex?.test(host) || false,

    // Environment used for Backend workflow
    //  Latest stable version pointing to the DEV api
    isPreStaging: domainPreStagingRegex?.test(host) || false,
  }
}

const { isDev, isStaging, isProd, isEns, isPreStaging } = checkEnvironment(window.location.host)

export const environmentName = (function () {
  if (isProd) {
    return 'production'
  } else if (isPreStaging) {
    return 'barn'
  } else if (isEns) {
    return 'ens'
  } else if (isStaging) {
    return 'staging'
  } else if (isDev) {
    return 'development'
  } else {
    return undefined
  }
})()

export { isDev, isStaging, isProd, isEns, isPreStaging }
