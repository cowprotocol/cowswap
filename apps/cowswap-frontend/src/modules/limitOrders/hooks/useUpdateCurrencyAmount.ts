import { useCallback } from 'react'

import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import { Writeable } from 'types'

import { Field } from 'legacy/state/types'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { LimitOrdersRawState } from 'modules/limitOrders/state/limitOrdersRawStateAtom'

import { calculateAmountForRate } from 'utils/orderUtils/calculateAmountForRate'

type CurrencyAmountProps = {
  activeRate: Fraction | null
  amount: CurrencyAmount<Currency> | null
  orderKind: OrderKind
}

export function useUpdateCurrencyAmount() {
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()

  return useCallback(
    (params: CurrencyAmountProps) => {
      const { activeRate, amount, orderKind } = params
      const field = isSellOrder(orderKind) ? Field.INPUT : Field.OUTPUT

      const calculatedAmount = calculateAmountForRate({
        activeRate,
        amount,
        field,
        inputCurrency,
        outputCurrency,
      })

      const newInputAmount = (field as Field) === Field.INPUT ? amount : calculatedAmount
      const newOutputAmount = (field as Field) === Field.OUTPUT ? amount : calculatedAmount

      const update: Partial<Writeable<LimitOrdersRawState>> = {
        orderKind,
        ...(newInputAmount
          ? { inputCurrencyAmount: FractionUtils.serializeFractionToJSON(newInputAmount) }
          : undefined),
        ...(newOutputAmount
          ? { outputCurrencyAmount: FractionUtils.serializeFractionToJSON(newOutputAmount) }
          : undefined),
      }

      updateLimitOrdersState(update)
    },
    [inputCurrency, outputCurrency, updateLimitOrdersState],
  )
}
