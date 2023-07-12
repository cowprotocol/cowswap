import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { OrderTypeKeys } from './reducer'

export const ContractDeploymentBlocks: Partial<Record<ChainId, number>> = {
  [ChainId.MAINNET]: 11469934,
  [ChainId.GNOSIS_CHAIN]: 13566914,
}

export const MARKET_OPERATOR_API_POLL_INTERVAL = ms`2s`
// We can have lots of limit orders and it creates a high load, so we poll them no so ofter as market orders
export const LIMIT_OPERATOR_API_POLL_INTERVAL = ms`15s`
export const PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL = ms`15s`
export const SPOT_PRICE_CHECK_POLL_INTERVAL = ms`15s`
export const EXPIRED_ORDERS_CHECK_POLL_INTERVAL = ms`15s`

export const OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE = new Percent(1, 100) // 1/100 => 0.01 => 1%

// Clear order's storage
export const ORDER_STORAGE_KEY = 'redux_localstorage_simple_orders'
export const ORDER_STATUSES_TO_CLEAR: OrderTypeKeys[] = ['expired', 'cancelled', 'fulfilled']
export const MAX_ITEMS_PER_STATUS = 10
