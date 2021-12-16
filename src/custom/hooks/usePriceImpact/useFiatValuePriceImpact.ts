import { Field } from 'state/swap/actions'

import { useHigherUSDValue } from 'hooks/useUSDCPrice'

import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { ParsedAmounts } from './types'

export default function useFiatValuePriceImpact(parsedAmounts: ParsedAmounts) {
  const fiatValueInput = useHigherUSDValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useHigherUSDValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  return priceImpact
}
