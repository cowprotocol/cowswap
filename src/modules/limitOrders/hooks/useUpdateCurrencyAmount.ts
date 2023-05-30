import { useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { Fraction } from '@uniswap/sdk-core'

import { Writeable } from 'types'

import { Field } from 'legacy/state/swap/actions'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { LimitOrdersRawState, updateLimitOrdersRawStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { calculateAmountForRate } from 'modules/limitOrders/utils/calculateAmountForRate'

import { FractionUtils } from 'utils/fractionUtils'

type CurrencyAmountProps = {
  activeRate: Fraction | null
  amount: Fraction | null
  orderKind: OrderKind
}

export function useUpdateCurrencyAmount() {
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()

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
