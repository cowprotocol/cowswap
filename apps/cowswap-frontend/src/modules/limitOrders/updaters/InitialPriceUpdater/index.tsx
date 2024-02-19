import { useSetAtom } from 'jotai'
import { useLayoutEffect, useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'

import { Writeable } from 'types'

import { useGetInitialPrice } from 'modules/limitOrders/hooks/useGetInitialPrice'
import { useUpdateActiveRate } from 'modules/limitOrders/hooks/useUpdateActiveRate'
import { LimitRateState, updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'

import { useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'

// Fetch and update initial price for the selected token pair
export function InitialPriceUpdater() {
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const updateRate = useUpdateActiveRate()

  const [isInitialPriceSet, setIsInitialPriceSet] = useState(false)
  const { price, isLoading } = useGetInitialPrice()
  const prevPrice = usePrevious(price)

  useLayoutEffect(() => {
    const update: Partial<Writeable<LimitRateState>> = {
      initialRate: price,
      // Don't change isLoading flag when price is already set
      isLoading: isInitialPriceSet ? false : isLoading,
    }

    if (!isInitialPriceSet) {
      update.isTypedValue = false
    }

    updateLimitRateState(update)
  }, [isInitialPriceSet, price, isLoading, updateLimitRateState])

  // Set initial price once
  useLayoutEffect(() => {
    if (!price || isInitialPriceSet || isLoading || prevPrice?.equalTo(price)) return

    setIsInitialPriceSet(true)
    updateRate({ activeRate: price, isTypedValue: false, isRateFromUrl: false, isAlternativeOrderRate: false })
    updateLimitRateState({ isLoading })
  }, [isInitialPriceSet, updateLimitRateState, updateRate, price, isLoading, prevPrice])

  // Reset initial price set flag when any token was changed
  useLayoutEffect(() => {
    setIsInitialPriceSet(false)
  }, [inputCurrency, outputCurrency])

  return null
}
