import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useLayoutEffect, useState } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'

import { Writeable } from 'types'

import { useGetInitialPrice } from '../../hooks/useGetInitialPrice'
import { useLimitOrdersRawState } from '../../hooks/useLimitOrdersRawState'
import { useUpdateActiveRate } from '../../hooks/useUpdateActiveRate'
import { limitRateAtom, LimitRateState, updateLimitRateAtom } from '../../state/limitRateAtom'

// Fetch and update initial price for the selected token pair
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InitialPriceUpdater() {
  const { inputCurrencyId, outputCurrencyId, chainId } = useLimitOrdersRawState()
  const { isTypedValue, activeRate } = useAtomValue(limitRateAtom)
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const updateRate = useUpdateActiveRate()

  const [isInitialPriceSet, setIsInitialPriceSet] = useState(isTypedValue)
  const { price, isLoading } = useGetInitialPrice()
  const prevPrice = usePrevious(price)
  const hasActivePrice = !!activeRate

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
    /**
     * When price is already set as activeRate
     * And another price update give the same value
     * Then skip price update
     */
    const shouldSkipPriceUpdate = Boolean(hasActivePrice && price && prevPrice?.equalTo(price))

    if (!price || isInitialPriceSet || isLoading || shouldSkipPriceUpdate) return

    setIsInitialPriceSet(true)

    updateRate({
      activeRate: price,
      isInitialPriceSet: true,
      isTypedValue: false,
      isRateFromUrl: false,
      isAlternativeOrderRate: false,
    })
    updateLimitRateState({ isLoading })
  }, [isInitialPriceSet, updateLimitRateState, updateRate, price, isLoading, prevPrice, hasActivePrice])

  // Reset initial price set flag when any token or chain was changed
  useLayoutEffect(() => {
    setIsInitialPriceSet(false)
  }, [inputCurrencyId, outputCurrencyId, chainId])

  return null
}
