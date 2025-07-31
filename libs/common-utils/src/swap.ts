import { EnvironmentName, environmentName } from './environments'

function _getSwapUrlByEnvironment(): Record<EnvironmentName, string> {
  return {
    production: process.env.REACT_APP_DOMAIN_REGEX_PROD || 'https://swap.cow.fi',
    barn: process.env.REACT_APP_DOMAIN_REGEX_BARN || 'https://barn.swap.cow.fi',
    ens: process.env.REACT_APP_DOMAIN_REGEX_ENS || 'https://ens.swap.cow.fi',
    staging: process.env.REACT_APP_DOMAIN_REGEX_STAGING || 'https://staging.swap.cow.fi',
    pr: process.env.REACT_APP_DOMAIN_REGEX_PR || 'https://pr.swap.cow.fi',
    development: process.env.REACT_APP_DOMAIN_REGEX_DEV || 'https://dev.swap.cow.fi',
    local: process.env.REACT_APP_DOMAIN_REGEX_LOCAL || 'https://localhost:3000',
  }
}

export function getSwapBaseUrl(): string {
  if (!environmentName) {
    throw new Error('Missing environment name!')
  } else {
    return _getSwapUrlByEnvironment()[environmentName]
  }
}
