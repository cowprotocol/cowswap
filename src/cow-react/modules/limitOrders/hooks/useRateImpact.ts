import { useAtomValue } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useMemo } from 'react'

export function useRateImpact(): number {
  const { activeRate, executionRate, isLoading, isLoadingExecutionRate } = useAtomValue(limitRateAtom)

  return useMemo(() => {
    if (!activeRate || activeRate.equalTo(0) || !executionRate || isLoading || isLoadingExecutionRate) return 0

    const ratePercent = +activeRate.divide(executionRate).multiply(100).subtract(100).toFixed(1)

    return !ratePercent || !Number.isFinite(ratePercent) || Number.isNaN(ratePercent) ? 0 : ratePercent
  }, [activeRate, executionRate, isLoading, isLoadingExecutionRate])
}
