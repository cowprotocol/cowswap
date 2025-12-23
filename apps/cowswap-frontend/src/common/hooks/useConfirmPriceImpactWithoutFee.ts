import { useCallback, useMemo, useState } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'

import { useConfirmationRequest } from 'common/hooks/useConfirmationRequest'

import { ALLOWED_PRICE_IMPACT_HIGH, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from '../constants/priceImpact'

function getDescription(priceImpactWithoutFee: Percent): string | undefined {
  const pct = priceImpactWithoutFee.toFixed(0)

  if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    return t`This swap has a price impact of at least ${pct}%.`
  }

  if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
    return t`This swap has a price impact of at least ${pct}%.`
  }

  return undefined
}

function shouldSkipInput(priceImpactWithoutFee: Percent): boolean {
  return (
    priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN) &&
    !priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useConfirmPriceImpactWithoutFee() {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const onEnable = useCallback(() => setIsConfirmed(true), [])
  const triggerConfirmation = useConfirmationRequest({ onEnable })

  const confirmPriceImpactWithoutFee = useCallback(
    async (priceImpactWithoutFee: Percent | undefined) => {
      if (
        !!priceImpactWithoutFee &&
        (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN) ||
          !priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH))
      ) {
        setIsConfirmed(false)
        try {
          const result = await triggerConfirmation({
            confirmWord: t`confirm`,
            title: t`Confirm Price Impact`,
            action: t`continue with this swap`,
            callToAction: t`Confirm Swap`,
            description: getDescription(priceImpactWithoutFee),
            skipInput: shouldSkipInput(priceImpactWithoutFee),
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
    [triggerConfirmation],
  )

  return useMemo(
    () => ({
      confirmPriceImpactWithoutFee,
      isConfirmed,
    }),
    [confirmPriceImpactWithoutFee, isConfirmed],
  )
}
