import { useMemo, useState } from 'react'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useReceiveAmountInfo } from './useReceiveAmountInfo'

export function useUnknownImpactWarning() {
  const receiveAmountInfo = useReceiveAmountInfo()

  const state = useState<boolean>(false)
  const [impactWarningAccepted, setImpactWarningAccepted] = state

  // reset the state when users change swap params
  useSafeEffect(() => {
    setImpactWarningAccepted(false)
  }, [
    receiveAmountInfo?.beforeNetworkCosts.sellAmount.currency,
    receiveAmountInfo?.beforeNetworkCosts.buyAmount.currency,
    receiveAmountInfo?.isSell,
  ])

  return useMemo(
    () => ({
      impactWarningAccepted,
      setImpactWarningAccepted,
    }),
    [impactWarningAccepted, setImpactWarningAccepted],
  )
}
