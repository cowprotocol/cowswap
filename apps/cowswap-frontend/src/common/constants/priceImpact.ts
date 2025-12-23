import { Percent } from '@uniswap/sdk-core'

export const PRICE_IMPACT_THRESHOLD = {
  low: new Percent(1, 100), // 1%
  high: new Percent(5, 100), // 5%
  critical: new Percent(10, 100), // 10%
} as const

export const BRIDGE_PRICE_IMPACT_THRESHOLD = {
  low: new Percent(5, 100), // 5%
  high: new Percent(10, 100), // 10%
  critical: new Percent(15, 100), // 15%
} as const
