import { useCallback, useMemo, useState } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'

import { useConfirmationRequest } from 'common/hooks/useConfirmationRequest'

import { BRIDGE_PRICE_IMPACT_THRESHOLD, PRICE_IMPACT_THRESHOLD } from '../constants/priceImpact'

interface ConfirmPriceImpactContext {
  confirmPriceImpactWithoutFee: (priceImpactWithoutFee: Percent | undefined) => Promise<boolean>
  isConfirmed: boolean
}

export function useConfirmPriceImpactWithoutFee(isBridge: boolean): ConfirmPriceImpactContext {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const onEnable = useCallback(() => setIsConfirmed(true), [])
  const triggerConfirmation = useConfirmationRequest({ onEnable })

  const confirmPriceImpactWithoutFee = useCallback(
    async (priceImpact: Percent | undefined) => {
      const { high: highThreshold, critical: criticalThreshold } = isBridge
        ? BRIDGE_PRICE_IMPACT_THRESHOLD
        : PRICE_IMPACT_THRESHOLD

      if (!!priceImpact && (!priceImpact.lessThan(criticalThreshold) || !priceImpact.lessThan(highThreshold))) {
        setIsConfirmed(false)
        try {
          const shouldSkipInput = priceImpact.lessThan(criticalThreshold) && !priceImpact.lessThan(highThreshold)

          const description = (() => {
            const pct = priceImpact.toFixed(0)

            if (!priceImpact.lessThan(criticalThreshold)) {
              return t`This swap has a price impact of at least ${pct}%.`
            }

            if (!priceImpact.lessThan(highThreshold)) {
              return t`This swap has a price impact of at least ${pct}%.`
            }

            return undefined
          })()

          const result = await triggerConfirmation({
            confirmWord: t`confirm`,
            title: t`Confirm Price Impact`,
            action: t`continue with this swap`,
            callToAction: t`Confirm Swap`,
            description,
            skipInput: shouldSkipInput,
          })
          setIsConfirmed(result)
          return result
        } catch {
          setIsConfirmed(false)
          return false
        }
      } else {
        setIsConfirmed(true)
        return true
      }
    },
    [triggerConfirmation, isBridge],
  )

  return useMemo(
    () => ({
      confirmPriceImpactWithoutFee,
      isConfirmed,
    }),
    [confirmPriceImpactWithoutFee, isConfirmed],
  )
}
