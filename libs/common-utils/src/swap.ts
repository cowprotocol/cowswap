import { EnvironmentName, environmentName } from './environments'

const DEFAULT_SWAP_URL = 'https://swap.cow.finance'

const swapUrlByEnvironment: Record<EnvironmentName, string> = {
  production: 'https://swap.cow.finance',
  barn: 'https://barn.swap.cow.finance',
  ens: 'https://ens.swap.cow.finance',
  staging: 'https://staging.swap.cow.finance',
  pr: 'https://dev.swap.cow.finance',
  development: 'https://dev.swap.cow.finance',
  local: 'https://localhost:3000',
}

export function getSwapBaseUrl(): string {
  if (!environmentName) {
    console.error('Missing environment name!')
    return DEFAULT_SWAP_URL
  }

  return swapUrlByEnvironment[environmentName]
}
