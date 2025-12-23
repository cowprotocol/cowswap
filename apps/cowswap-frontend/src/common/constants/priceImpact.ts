import { Percent } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

// one basis JSBI.BigInt
const BPS_BASE = JSBI.BigInt(10000)

const ALLOWED_PRICE_IMPACT_LOW = new Percent(JSBI.BigInt(100), BPS_BASE) // 1%
const ALLOWED_PRICE_IMPACT_MEDIUM = new Percent(JSBI.BigInt(300), BPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH = new Percent(JSBI.BigInt(500), BPS_BASE) // 5%
const BLOCKED_PRICE_IMPACT_NON_EXPERT = new Percent(JSBI.BigInt(1500), BPS_BASE) // 15%
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = new Percent(JSBI.BigInt(1000), BPS_BASE) // 10%

export const PRICE_IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
]
