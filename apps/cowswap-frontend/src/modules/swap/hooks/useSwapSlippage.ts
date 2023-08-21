import { Percent } from '@uniswap/sdk-core'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'legacy/constants'
import { useUserSlippageToleranceWithDefault } from 'legacy/state/user/hooks'

export function useSwapSlippage(): Percent {
  return useUserSlippageToleranceWithDefault(INITIAL_ALLOWED_SLIPPAGE_PERCENT)
}
