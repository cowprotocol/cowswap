import { useCallback, useState } from 'react'

import { ALLOWED_PRICE_IMPACT_HIGH, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from '@cowprotocol/common-const'
import { Percent } from '@uniswap/sdk-core'

import { useConfirmationRequest } from 'common/hooks/useConfirmationRequest'

function getDescription(priceImpactWithoutFee: Percent) {
  if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    return `This swap has a price impact of at least ${PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(0)}%.`
  }

  if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
    return `This swap has a price impact of at least ${ALLOWED_PRICE_IMPACT_HIGH.toFixed(0)}%.`
  }

  return undefined
}

function shouldSkipInput(priceImpactWithoutFee: Percent) {
  return (
    priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN) &&
    !priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)
  )
}

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
    [triggerConfirmation]
  )

  return {
    confirmPriceImpactWithoutFee,
    isConfirmed,
  }
}
