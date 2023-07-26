import { useAtomValue } from 'jotai'

import { gasPriceStrategyAtom, GpPriceStrategy } from 'legacy/state/gas/atoms'

export function useGetGpPriceStrategy(): GpPriceStrategy {
  return useAtomValue(gasPriceStrategyAtom)
}
