import { ChainId, Token } from '@uniswap/sdk'
import { GPv2Settlement, GPv2AllowanceManager } from '@gnosis.pm/gp-v2-contracts/networks.json'

export const RADIX_DECIMAL = 10
export const RADIX_HEX = 16

export const DEFAULT_PRECISION = 6
export const SHORT_PRECISION = 4
export const SHORTEST_PRECISION = 3

export const APP_ID = Number(process.env.REACT_APP_ID)

// reexport all Uniswap constants everything
export * from '@src/constants/index'

// TODO: When contracts are deployed, we can load this from the NPM package
export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: GPv2Settlement[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2Settlement[ChainId.RINKEBY].address,
  [ChainId.XDAI]: GPv2Settlement[ChainId.XDAI].address
}

export const GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: GPv2AllowanceManager[ChainId.MAINNET].address,
  [ChainId.RINKEBY]: GPv2AllowanceManager[ChainId.RINKEBY].address,
  [ChainId.XDAI]: GPv2AllowanceManager[ChainId.XDAI].address
}

// See https://github.com/gnosis/gp-v2-contracts/commit/821b5a8da213297b0f7f1d8b17c893c5627020af#diff-12bbbe13cd5cf42d639e34a39d8795021ba40d3ee1e1a8282df652eb161a11d6R13
export const BUY_ETHER_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const BUY_ETHER_TOKEN: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, BUY_ETHER_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.XDAI]: new Token(ChainId.XDAI, BUY_ETHER_ADDRESS, 18, 'xDAI', 'xDAI')
}

export const ORDER_ID_SHORT_LENGTH = 8
