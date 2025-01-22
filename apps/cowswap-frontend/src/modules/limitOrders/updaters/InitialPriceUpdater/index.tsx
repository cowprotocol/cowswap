import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useLayoutEffect, useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'

import { Writeable } from 'types'

import { useGetInitialPrice } from '../../hooks/useGetInitialPrice'
import { useLimitOrdersRawState } from '../../hooks/useLimitOrdersRawState'
import { useUpdateActiveRate } from '../../hooks/useUpdateActiveRate'
import { limitRateAtom, LimitRateState, updateLimitRateAtom } from '../../state/limitRateAtom'

// Fetch and update initial price for the selected token pair
export function InitialPriceUpdater() {
  const { inputCurrencyId, outputCurrencyId, chainId } = useLimitOrdersRawState()
  const { isTypedValue } = useAtomValue(limitRateAtom)
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const updateRate = useUpdateActiveRate()

  const [isInitialPriceSet, setIsInitialPriceSet] = useState(isTypedValue)
  const { price, isLoading } = useGetInitialPrice()
  const prevPrice = usePrevious(price)

  useEffect(() => {
    setIsInitialPriceSet(isTypedValue)
  }, [isTypedValue])

  useLayoutEffect(() => {
    const update: Partial<Writeable<LimitRateState>> = {
      initialRate: price,
      // Don't change isLoading flag when price is already set
      isLoading: isInitialPriceSet ? false : isLoading,
    }

    updateLimitRateState(update)
  }, [isInitialPriceSet, price, isLoading, updateLimitRateState])

  // Set initial price once
  useLayoutEffect(() => {
    if (!price || isInitialPriceSet || isLoading || prevPrice?.equalTo(price)) return

    setIsInitialPriceSet(true)

    updateRate({
      activeRate: price,
      isInitialPriceSet: true,
      isTypedValue: false,
      isRateFromUrl: false,
      isAlternativeOrderRate: false,
    })
    updateLimitRateState({ isLoading })
  }, [isInitialPriceSet, updateLimitRateState, updateRate, price, isLoading, prevPrice])

  // Reset initial price set flag when any token was changed
  useLayoutEffect(() => {
    setIsInitialPriceSet(false)
  }, [inputCurrencyId, outputCurrencyId, chainId])

  return null
}
