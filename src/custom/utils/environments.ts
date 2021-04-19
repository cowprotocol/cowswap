export function checkEnvironment(host: string) {
  const getRegex = (regex: string | undefined) => (regex ? new RegExp(regex) : undefined)

  const domainDevRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_DEV)
  const domainStagingRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_STAGING)
  const domainProdRegex = getRegex(process.env.REACT_APP_DOMAIN_REGEX_PROD)

  return {
    isDev: domainDevRegex?.test(host) || false,
    isStaging: domainStagingRegex?.test(host) || false,
    isProd: domainProdRegex?.test(host) || false
  }
}

const { isDev, isStaging, isProd } = checkEnvironment(window.location.host)

export { isDev, isStaging, isProd }
