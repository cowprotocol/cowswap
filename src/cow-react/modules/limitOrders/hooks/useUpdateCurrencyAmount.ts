import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { LimitOrdersRawState, updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { calculateAmountForRate } from '@cow/modules/limitOrders/utils/calculateAmountForRate'
import { Field } from 'state/swap/actions'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { Fraction } from '@uniswap/sdk-core'
import { Writeable } from '@cow/types'
import { useLimitOrdersFullState } from '@cow/modules/limitOrders/hooks/useLimitOrdersFullState'

type CurrencyAmountProps = {
  activeRate: Fraction | null
  amount: Fraction | null
  orderKind: OrderKind
}

export function useUpdateCurrencyAmount() {
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const { inputCurrency, outputCurrency } = useLimitOrdersFullState()

  return useCallback(
    (params: CurrencyAmountProps) => {
      const { activeRate, amount, orderKind } = params
      const field = orderKind === OrderKind.SELL ? Field.INPUT : Field.OUTPUT

      const calculatedAmount = calculateAmountForRate({
        activeRate,
        amount,
        field,
        inputCurrency,
        outputCurrency,
      })

      const update: Partial<Writeable<LimitOrdersRawState>> = {
        orderKind,
        inputCurrencyAmount: FractionUtils.serializeFractionToJSON(field === Field.INPUT ? amount : calculatedAmount),
        outputCurrencyAmount: FractionUtils.serializeFractionToJSON(field === Field.OUTPUT ? amount : calculatedAmount),
      }

      updateLimitOrdersState(update)
    },
    [inputCurrency, outputCurrency, updateLimitOrdersState]
  )
}
