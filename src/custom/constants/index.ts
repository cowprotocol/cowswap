import { ChainId } from '@uniswap/sdk'

// reexport everything
export * from '@src/constants/index'

// TODO: When contracts are deployed, we can load this from the NPM package
export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: '0x6F400810b62df8E13fded51bE75fF5393eaa841F',
  [ChainId.RINKEBY]: '0xC576eA7bd102F7E476368a5E98FA455d1Ea34dE2'
  // TODO: extend chainId for adding xDAI
}

export const GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: '0x6F400810b62df8E13fded51bE75fF5393eaa841F',
  [ChainId.RINKEBY]: '0xC576eA7bd102F7E476368a5E98FA455d1Ea34dE2'
  // TODO: extend chainId for adding xDAI
}
