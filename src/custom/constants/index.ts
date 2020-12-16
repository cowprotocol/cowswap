import { ChainId } from '@uniswap/sdk'
import { GPv2Settlement, GPv2AllowanceManager } from '@gnosis.pm/gp-v2-contracts/networks.json'

export const APP_ID = Number(process.env.REACT_APP_ID)

// reexport all Uniswap constants everything
export * from '@src/constants/index'

// TODO: When contracts are deployed, we can load this from the NPM package
export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  // [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address, // Not yet deployed
  [ChainId.RINKEBY]: GPv2Settlement[ChainId.RINKEBY].address
  // [ChainId.xDAI]: GPv2Settlement[ChainId.xDAI].address // Not yet deployed
}

export const GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  // [ChainId.MAINNET]: GPv2AllowanceManager[ChainId.MAINNET].address, // Not yet deployed
  [ChainId.RINKEBY]: GPv2AllowanceManager[ChainId.RINKEBY].address
  // [ChainId.xDAI]: GPv2AllowanceManager[ChainId.xDAI].address // Not yet deployed
}
