import { useAtomValue } from 'jotai'

import { gasPriceStrategyAtom, GpPriceStrategy } from '../state/gas/atoms'

export function useGetGpPriceStrategy(): GpPriceStrategy {
  return useAtomValue(gasPriceStrategyAtom)
}
