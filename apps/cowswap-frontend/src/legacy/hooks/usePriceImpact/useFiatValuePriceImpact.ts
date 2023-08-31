import { computeFiatValuePriceImpact } from 'legacy/utils/computeFiatValuePriceImpact'

import { useHigherUSDValue } from 'modules/fiatAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { ParsedAmounts } from './types'

export function useFiatValuePriceImpact({ INPUT, OUTPUT }: ParsedAmounts) {
  const areBothValuesPresent = !!INPUT && !!OUTPUT
  // prevent querying any fiat estimation unless both values are filled in
  const input = areBothValuesPresent ? INPUT : undefined
  const output = areBothValuesPresent ? OUTPUT : undefined

  const { value: fiatValueInput, isLoading: inputIsLoading } = useHigherUSDValue(input)
  const { value: fiatValueOutput, isLoading: outputIsLoading } = useHigherUSDValue(output)

  // Only compute price impact after BOTH finished loading
  // This prevents the impact look like it's ready but still loading
  const priceImpact =
    !inputIsLoading && !outputIsLoading ? computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput) : undefined

  const isLoading = areBothValuesPresent && (inputIsLoading || outputIsLoading)

  return useSafeMemo(() => ({ priceImpact, isLoading }), [priceImpact, isLoading])
}
