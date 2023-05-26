import { useCallback } from 'react'
import { settleTwapOrder } from '../services/settleTwapOrder'
import { setupExtensibleFallbackHandler } from '../services/setupExtensibleFallbackHandler'
import { useAdvancedOrdersDerivedState } from '../../advancedOrders'
import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'
import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'
import { Nullish } from '../../../types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useAtomValue } from 'jotai'
import { twapOrderAtom } from '../state/twapOrderAtom'
import ms from 'ms.macro'

export interface TwapFormActions {
  createTwapOrder(): void
  setFallbackHandler(): void
}

export function useTwapFormActions(): TwapFormActions {
  const twapOrder = useAtomValue(twapOrderAtom)

  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const extensibleFallbackContext = useExtensibleFallbackContext()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)

  const createTwapOrder = useCallback(() => {
    if (!twapOrderCreationContext || !twapOrder) return

    const startTime = Math.round((Date.now() + ms`1m`) / 1000) // Now + 1 min

    settleTwapOrder({ ...twapOrder, startTime }, twapOrderCreationContext)
  }, [twapOrder, twapOrderCreationContext])

  const setFallbackHandler = useCallback(() => {
    if (!extensibleFallbackContext) return

    setupExtensibleFallbackHandler(extensibleFallbackContext)
  }, [extensibleFallbackContext])

  return { createTwapOrder, setFallbackHandler }
}
