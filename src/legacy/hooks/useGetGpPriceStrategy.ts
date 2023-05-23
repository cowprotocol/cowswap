import { gasPriceStrategyAtom, GpPriceStrategy } from 'legacy/state/gas/atoms'
import { useAtomValue } from 'jotai/utils'

export function useGetGpPriceStrategy(): GpPriceStrategy {
  return useAtomValue(gasPriceStrategyAtom)
}
