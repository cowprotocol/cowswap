import { useCallback, useMemo, useState } from 'react'

import { ALLOWED_PRICE_IMPACT_HIGH, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from '@cowprotocol/common-const'
import { Percent } from '@uniswap/sdk-core'

import { useConfirmationRequest } from 'common/hooks/useConfirmationRequest'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getDescription(priceImpactWithoutFee: Percent) {
  if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    return `This swap has a price impact of at least ${priceImpactWithoutFee.toFixed(0)}%.`
  }

  if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
    return `This swap has a price impact of at least ${priceImpactWithoutFee.toFixed(0)}%.`
  }

  return undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function shouldSkipInput(priceImpactWithoutFee: Percent) {
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
            confirmWord: 'confirm',
            title: 'Confirm Price Impact',
            action: 'continue with this swap',
            callToAction: 'Confirm Swap',
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
