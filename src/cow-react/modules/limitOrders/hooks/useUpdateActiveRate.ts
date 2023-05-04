import { useCallback } from 'react'
import { useLimitOrdersDerivedState } from '@cow/modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitRateAtom, LimitRateState, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { updateLimitOrdersRawStateAtom } from '@cow/modules/limitOrders'

type RateUpdateParams = Pick<LimitRateState, 'activeRate' | 'isTypedValue' | 'isRateFromUrl'>

export interface UpdateRateCallback {
  (update: RateUpdateParams): void
}

export function useUpdateActiveRate(): UpdateRateCallback {
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersDerivedState()
  const rateState = useAtomValue(limitRateAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const updateRateState = useUpdateAtom(updateLimitRateAtom)

  const { isRateFromUrl: currentIsRateFromUrl } = rateState

  return useCallback(
    (update: RateUpdateParams) => {
      const { activeRate, isRateFromUrl } = update

      updateRateState(update)

      if (activeRate) {
        // Don't update amounts when rate is set from URL. See useSetupLimitOrderAmountsFromUrl()
        if (currentIsRateFromUrl || isRateFromUrl) {
          return
        }

        updateCurrencyAmount({
          activeRate,
          amount: orderKind === OrderKind.SELL ? inputCurrencyAmount : outputCurrencyAmount,
          orderKind,
        })
      }

      // Clear input/output amount based on the orderKind, when there is no active rate
      if (activeRate === null) {
        if (orderKind === OrderKind.SELL) {
          updateLimitOrdersState({ outputCurrencyAmount: null })
        } else {
          updateLimitOrdersState({ inputCurrencyAmount: null })
        }
      }
    },
    [
      orderKind,
      inputCurrencyAmount,
      outputCurrencyAmount,
      updateCurrencyAmount,
      updateRateState,
      updateLimitOrdersState,
      currentIsRateFromUrl,
    ]
  )
}
