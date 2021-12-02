import { Percent } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from 'constants/chains'

export const ContractDeploymentBlocks: Partial<Record<ChainId, number>> = {
  [ChainId.MAINNET]: 11469934,
  [ChainId.RINKEBY]: 7724701,
  [ChainId.XDAI]: 13566914,
}

export const OPERATOR_API_POLL_INTERVAL = 2000 // in ms
export const PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL = 15000 // in ms

export const OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE = new Percent(1, 100) // 1/100 => 0.01 => 1%
