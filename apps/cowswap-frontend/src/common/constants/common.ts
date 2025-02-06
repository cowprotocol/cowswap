import { BigNumber } from '@ethersproject/bignumber'
import { Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

export const HIGH_FEE_WARNING_PERCENTAGE = new Percent(1, 10) // 10%

// Price difference thresholds
export const PENDING_EXECUTION_THRESHOLD_PERCENTAGE = 0.01 // 0.01% - threshold for considering an order close enough to market price for execution
export const GOOD_PRICE_THRESHOLD_PERCENTAGE = 1.0 // 1% or less difference - good price
export const FAIR_PRICE_THRESHOLD_PERCENTAGE = 5.0 // 5% or less difference - fair price

export const MAX_ORDER_DEADLINE = ms`1y` // https://github.com/cowprotocol/infrastructure/blob/staging/services/Pulumi.yaml#L7

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
export const GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export const APP_HEADER_ELEMENT_ID = 'cowswap-app-header'
