import { ChainId } from '@uniswap/sdk'

// TODO: Load app Id
export const APP_ID = 0

// TODO: The addresses will be exported as plain JSON file in the future

// reexport all Uniswap constants everything
export * from '@src/constants/index'

// TODO: When contracts are deployed, we can load this from the NPM package
export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: '0x8cEe82E709e770733180Ef222a8989B923fedE01', // TODO: No yet.
  [ChainId.RINKEBY]: '0x828229A8432A89B8624B6AF91eC0BB65b9517156'
  // TODO: extend chainId for adding xDAI
}

export const GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  // [ChainId.MAINNET]: ,
  [ChainId.RINKEBY]: '0x31658E2405Ea55446Ec2271AAD661E706DEeFB33'
  // TODO: extend chainId for adding xDAI
}
