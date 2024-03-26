import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useUpdateCurrencyAmount } from 'modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { limitRateAtom, LimitRateState, updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'

type RateUpdateParams = Pick<LimitRateState, 'activeRate' | 'isTypedValue' | 'isRateFromUrl' | 'isAlternativeOrderRate'>

export interface UpdateRateCallback {
  (update: RateUpdateParams): void
}

export function useUpdateActiveRate(): UpdateRateCallback {
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersDerivedState()
  const rateState = useAtomValue(limitRateAtom)
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const updateRateState = useSetAtom(updateLimitRateAtom)

  const { isRateFromUrl: currentIsRateFromUrl } = rateState

  return useCallback(
    (update: RateUpdateParams) => {
      const { activeRate, isRateFromUrl, isAlternativeOrderRate } = update

      updateRateState(update)

      const isSell = isSellOrder(orderKind)

      if (activeRate) {
        // Don't update amounts when rate is set from URL. See useSetupLimitOrderAmountsFromUrl()
        // Don't update amounts when rate is set from AlternativeOrder. See AlternativeLimitOrderUpdater
        if (currentIsRateFromUrl || isRateFromUrl || isAlternativeOrderRate) {
          return
        }

        updateCurrencyAmount({
          activeRate,
          amount: isSell ? inputCurrencyAmount : outputCurrencyAmount,
          orderKind,
        })
      }

      // Clear input/output amount based on the orderKind, when there is no active rate
      if (activeRate === null) {
        if (isSell) {
          updateLimitOrdersState({ outputCurrencyAmount: null })
        } else {
          updateLimitOrdersState({ inputCurrencyAmount: null })
        }
      }
    },
    [
      updateRateState,
      orderKind,
      currentIsRateFromUrl,
      updateCurrencyAmount,
      inputCurrencyAmount,
      outputCurrencyAmount,
      updateLimitOrdersState,
    ]
  )
}
