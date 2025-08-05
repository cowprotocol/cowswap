import { EnvironmentName, environmentName } from './environments'

const DEFAULT_SWAP_URL = 'https://swap.cow.fi'

const swapUrlByEnvironment: Record<EnvironmentName, string> = {
  production: 'https://swap.cow.fi',
  barn: 'https://barn.swap.cow.fi',
  ens: 'https://ens.swap.cow.fi',
  staging: 'https://staging.swap.cow.fi',
  pr: 'https://dev.swap.cow.fi',
  development: 'https://dev.swap.cow.fi',
  local: 'https://localhost:3000',
}

export function getSwapBaseUrl(): string {
  if (!environmentName) {
    console.error('Missing environment name!')
    return DEFAULT_SWAP_URL
  }

  return swapUrlByEnvironment[environmentName]
}
