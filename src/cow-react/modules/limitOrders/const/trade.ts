import { Percent, Fraction } from '@uniswap/sdk-core'

export const LIMIT_ORDER_SLIPPAGE = new Percent(0)
export const LOW_RATE_THRESHOLD_PERCENT = -5
export const MARKET_RATE_ADJUSTMENT = new Fraction(1, 1000) // 0.1%
