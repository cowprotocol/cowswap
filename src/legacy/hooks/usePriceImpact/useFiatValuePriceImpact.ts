import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { computeFiatValuePriceImpact } from 'legacy/utils/computeFiatValuePriceImpact'

import { ParsedAmounts } from './types'

export default function useFiatValuePriceImpact({ INPUT, OUTPUT }: ParsedAmounts) {
  const areBothValuesPresent = !!INPUT && !!OUTPUT
  // prevent querying any fiat estimation unless both values are filled in
  const input = areBothValuesPresent ? INPUT : undefined
  const output = areBothValuesPresent ? OUTPUT : undefined

  const { value: fiatValueInput, isLoading: inputIsLoading } = useHigherUSDValue(input)
  const { value: fiatValueOutput, isLoading: outputIsLoading } = useHigherUSDValue(output)
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  const isLoading = areBothValuesPresent && (inputIsLoading || outputIsLoading)

  return { priceImpact, isLoading }
}
