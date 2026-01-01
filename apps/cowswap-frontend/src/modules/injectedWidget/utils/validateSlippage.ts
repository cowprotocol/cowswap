import { MAX_SLIPPAGE_BPS, MIN_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { FlexibleSlippageConfig, resolveFlexibleConfigValues } from '@cowprotocol/widget-lib'

function validateDefaultValue(defaultValue: number | undefined, min?: number, max?: number): string | undefined {
  if (typeof defaultValue !== 'number') return undefined

  if (defaultValue < (min ?? 0)) {
    return `Default slippage must be higher than or equal to min slippage of ${min ?? 0} BPS!`
  }

  if (defaultValue > (max ?? MAX_SLIPPAGE_BPS)) {
    return `Default slippage must be lower than or equal to max slippage of ${max ?? MAX_SLIPPAGE_BPS} BPS!`
  }

  return undefined
}

export function validateSlippage(input: FlexibleSlippageConfig | undefined): string[] | undefined {
  if (!input) return undefined

  const configs = resolveFlexibleConfigValues(input)

  const errors = configs.flatMap(({ min, max, defaultValue }) => {
    const minSlippageError = min && min < MIN_SLIPPAGE_BPS ? `Min slippage can't be less than 0 BPS!` : undefined

    const maxSlippageError =
      max && max > MAX_SLIPPAGE_BPS ? `Max slippage can't be more than ${MAX_SLIPPAGE_BPS} BPS!` : undefined

    const isMaxSlippageLessOrEqualToMin = typeof min === 'number' && typeof max === 'number' && max <= min
    const maxSlippageEqualsOrLessToMinError = isMaxSlippageLessOrEqualToMin
      ? `Max slippage can't be less than or equal to min slippage!`
      : undefined

    const defaultSlippageError = validateDefaultValue(defaultValue, min, max)

    return [minSlippageError, maxSlippageError, maxSlippageEqualsOrLessToMinError, defaultSlippageError].filter(
      isTruthy,
    )
  })

  return errors.length > 0 ? errors : undefined
}
