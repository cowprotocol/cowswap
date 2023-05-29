import { useAtomValue } from 'jotai/utils'

import { gasPriceStrategyAtom, GpPriceStrategy } from 'legacy/state/gas/atoms'

export function useGetGpPriceStrategy(): GpPriceStrategy {
  return useAtomValue(gasPriceStrategyAtom)
}
