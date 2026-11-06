import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'

import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'

export function useRateImpact(isInverted = false): number {
  const { activeRate, marketRate, isLoading, isLoadingMarketRate } = useAtomValue(limitRateAtom)

  return useMemo(() => {
    if (isLoading || isLoadingMarketRate || !activeRate || !marketRate) return 0
    if (activeRate.equalTo(0) || marketRate.equalTo(0)) return 0

    const active = FractionUtils.fractionLikeToFraction(activeRate)
    const market = FractionUtils.fractionLikeToFraction(marketRate)
    const ratio = isInverted ? market.divide(active) : active.divide(market)
    const ratePercent = Number(ratio.subtract(1).multiply(100).toFixed(1))

    return Number.isFinite(ratePercent) ? ratePercent : 0
  }, [activeRate, marketRate, isLoading, isLoadingMarketRate, isInverted])
}
