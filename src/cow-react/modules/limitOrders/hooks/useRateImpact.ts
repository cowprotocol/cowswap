import { useAtomValue } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useMemo } from 'react'

export function useRateImpact(): number {
  const { activeRate, marketRate, isLoading, isLoadingMarketRate } = useAtomValue(limitRateAtom)

  return useMemo(() => {
    const noActiveRate = !activeRate || activeRate.equalTo(0)
    const noExecutionRate = !marketRate || marketRate.equalTo(0)

    if (noActiveRate || noExecutionRate || isLoading || isLoadingMarketRate) return 0

    const ratePercent = +activeRate.divide(marketRate).multiply(100).subtract(100).toFixed(1)

    return !ratePercent || !Number.isFinite(ratePercent) || Number.isNaN(ratePercent) ? 0 : ratePercent
  }, [activeRate, marketRate, isLoading, isLoadingMarketRate])
}
