import { useCallback } from 'react'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitRateAtom, LimitRateState, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { OrderKind } from 'state/orders/actions'
import { useUpdateCurrencyAmount } from '@cow/modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { LimitOrdersState, updateLimitOrdersAtom } from '@cow/modules/limitOrders'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'

type RateUpdateParams = Pick<LimitRateState, 'activeRate' | 'isTypedValue' | 'isRateFromUrl'>

export interface UpdateRateCallback {
  (update: RateUpdateParams): void
}

export function useUpdateActiveRate(): UpdateRateCallback {
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersTradeState()
  const rateState = useAtomValue(limitRateAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const updateRateState = useUpdateAtom(updateLimitRateAtom)

  const tradeState = useSafeMemoObject({
    inputCurrencyAmount,
    outputCurrencyAmount,
    orderKind,
  })

  const { isRateFromUrl: currentIsRateFromUrl } = rateState

  return useCallback(
    (update: RateUpdateParams) => {
      const { activeRate, isRateFromUrl } = update

      updateRateState(update)

      if (activeRate) {
        // Don't update amounts when rate is come from URL. See useSetupLimitOrderAmountsFromUrl()
        if (currentIsRateFromUrl || isRateFromUrl) {
          return
        }

        const field: keyof LimitOrdersState =
          tradeState.orderKind === OrderKind.SELL ? 'inputCurrencyAmount' : 'outputCurrencyAmount'

        updateCurrencyAmount({
          [field]: tradeState[field],
          keepOrderKind: true,
        })
      }

      if (activeRate === null) {
        const field: keyof LimitOrdersState =
          tradeState.orderKind === OrderKind.SELL ? 'outputCurrencyAmount' : 'inputCurrencyAmount'

        // Clear input/output amount based on the orderKind, when there is no active rate
        updateLimitOrdersState({
          [field]: null,
        })
      }
    },
    [tradeState, updateCurrencyAmount, updateRateState, updateLimitOrdersState, currentIsRateFromUrl]
  )
}
