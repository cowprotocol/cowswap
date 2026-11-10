import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import type { Fraction } from '@cowprotocol/currency'
import { Media } from '@cowprotocol/ui'

import { priceChartModalOpenAtom, usePriceChartVisibility } from 'modules/priceChart'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'
import { useUpdateActiveRate } from './useUpdateActiveRate'

import { limitPickerModeAtom } from '../state/limitPickerModeAtom'

export function useLimitPriceChartPicker(): ((rate: Fraction) => void) | undefined {
  const { isUnlocked } = useLimitOrdersDerivedState()
  const [isLimitPickerMode, setLimitPickerMode] = useAtom(limitPickerModeAtom)
  const [isChartModalOpen, setChartModalOpen] = useAtom(priceChartModalOpenAtom)
  const isPriceChartVisible = usePriceChartVisibility()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const updateRate = useUpdateActiveRate()
  const isPriceChartOpen = isUnlocked && isPriceChartVisible && (!isUpToLarge || isChartModalOpen)

  useEffect(() => {
    if (!isPriceChartOpen) {
      setLimitPickerMode(false)
    }
  }, [isPriceChartOpen, setLimitPickerMode])

  const selectLimitPrice = useCallback(
    (activeRate: Fraction) => {
      updateRate({ activeRate, isAlternativeOrderRate: false, isRateFromUrl: false, isTypedValue: false })
      setLimitPickerMode(false)
      setChartModalOpen(false)
    },
    [setChartModalOpen, setLimitPickerMode, updateRate],
  )

  return isLimitPickerMode ? selectLimitPrice : undefined
}
