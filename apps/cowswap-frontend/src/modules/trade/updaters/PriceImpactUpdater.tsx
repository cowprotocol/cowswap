import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import ms from 'ms.macro'

import { PriceImpact, useFiatValuePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { priceImpactAtom } from '../state/priceImpactAtom'

const PRICE_IMPACT_UPDATE_THROTTLE = ms`150ms`

export function PriceImpactUpdater(): null {
  const updatePriceImpact = useSetAtom(priceImpactAtom)
  const priceImpactState = useFiatValuePriceImpact()

  const pendingRef = useRef<PriceImpact | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Trailing-edge only: states that revert within the window (loading blinks) never reach the atom
  useSafeEffect(() => {
    if (!priceImpactState) {
      pendingRef.current = null

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      return
    }

    const { isLoading, priceImpact } = priceImpactState

    pendingRef.current = { loading: isLoading, priceImpact }

    if (timeoutRef.current) return

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null

      if (pendingRef.current) updatePriceImpact(pendingRef.current)
    }, PRICE_IMPACT_UPDATE_THROTTLE)
  }, [updatePriceImpact, priceImpactState])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return null
}
