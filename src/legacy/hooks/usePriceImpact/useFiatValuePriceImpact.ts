import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { Field } from 'legacy/state/swap/actions'
import { computeFiatValuePriceImpact } from 'legacy/utils/computeFiatValuePriceImpact'

import { ParsedAmounts } from './types'

export default function useFiatValuePriceImpact(parsedAmounts: ParsedAmounts) {
  const { value: fiatValueInput, isLoading: inputIsLoading } = useHigherUSDValue(parsedAmounts[Field.INPUT])
  const { value: fiatValueOutput, isLoading: outputIsLoading } = useHigherUSDValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  return { priceImpact, isLoading: inputIsLoading || outputIsLoading }
}
