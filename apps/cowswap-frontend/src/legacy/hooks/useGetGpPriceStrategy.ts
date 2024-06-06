import { useAtomValue } from 'jotai'

import { gasPriceStrategyAtom, PriceStrategy } from 'legacy/state/gas/atoms'

export function useGetGpPriceStrategy(): PriceStrategy {
  return useAtomValue(gasPriceStrategyAtom)
}
