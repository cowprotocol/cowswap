function getDomainRegex(domainPrefix: string | undefined): RegExp | undefined {
  return domainPrefix ? new RegExp('^' + domainPrefix.replaceAll('.', '\\.'), 'i') : undefined
}

export function getAnalyticsId(): string | undefined {
  const domainDevRegex = getDomainRegex(process.env.REACT_APP_DOMAIN_PREFIX_DEV)
  const domainStagingRegex = getDomainRegex(process.env.REACT_APP_DOMAIN_PREFIX_STAGING)
  const domainProdRegex = getDomainRegex(process.env.REACT_APP_DOMAIN_PREFIX_PROD)

  const host = window.location.host
  if (domainDevRegex && domainDevRegex.test(host)) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_DEV
  } else if (domainStagingRegex && domainStagingRegex.test(host)) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_STAGING
  } else if (domainProdRegex && domainProdRegex.test(host)) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_PROD
  }

  return undefined
}
