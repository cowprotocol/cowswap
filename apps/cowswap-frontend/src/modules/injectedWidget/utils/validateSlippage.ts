import { MAX_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { SlippageConfig } from '@cowprotocol/widget-lib'

import { resolveFlexibleConfigValues } from './resolveFlexibleConfigValues'


export function validateSlippage(input: SlippageConfig | undefined): string[] | undefined {
  if (!input) return undefined

  const min = resolveFlexibleConfigValues(input.min)

  const negativeSlippageError = min.some((value) => value < 0)
    ? `Min slippage can't be less than 0 BPS!`
    : undefined

  const max = resolveFlexibleConfigValues(input.max)
  const slippageToHighError = max.some((value) => value >= MAX_SLIPPAGE_BPS)
    ? `Max slippage can't be more than ${MAX_SLIPPAGE_BPS}`
    : undefined

  const defaultSlippages = resolveFlexibleConfigValues(input.defaultValue)
  // todo need to compare with min/max from input
  const defaultSlippageError = defaultSlippages.some((value) => value < 0 && value >= MAX_SLIPPAGE_BPS)
    ? `Default slippage must be between 0 and ${MAX_SLIPPAGE_BPS} BPS!`
    : undefined

  const errors = [negativeSlippageError, slippageToHighError, defaultSlippageError].filter(isTruthy)

  return errors.length > 0 ? errors : undefined
}
