import { gasPriceStrategyAtom, GpPriceStrategy } from 'state/gas/atoms'
import { useAtomValue } from 'jotai/utils'

export function useGetGpPriceStrategy(): GpPriceStrategy {
  return useAtomValue(gasPriceStrategyAtom)
}
