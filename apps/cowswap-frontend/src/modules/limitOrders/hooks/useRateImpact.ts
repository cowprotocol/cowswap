import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'

const FRACTION_DIGITS = 15

export function useRateImpact(): number {
  const { activeRate, marketRate, isLoading, isLoadingMarketRate } = useAtomValue(limitRateAtom)

  return useMemo(() => {
    const noActiveRate = !activeRate || activeRate.equalTo(0)
    const noExecutionRate = !marketRate || marketRate.equalTo(0)

    if (noActiveRate || noExecutionRate || isLoading || isLoadingMarketRate) return 0

    const ar = +activeRate.toFixed(FRACTION_DIGITS)
    const mr = +marketRate.toFixed(FRACTION_DIGITS)
    const ratio = ar / mr
    const percent = ratio * 100 - 100

    const ratePercent = +percent.toFixed(1)

    return !ratePercent || !Number.isFinite(ratePercent) || Number.isNaN(ratePercent) ? 0 : ratePercent
  }, [activeRate, marketRate, isLoading, isLoadingMarketRate])
}
