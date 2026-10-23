import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Fraction } from '@cowprotocol/currency'

import { Writeable } from 'types'

import { Field } from 'legacy/state/types'

import { calculateAmountForRate } from 'utils/orderUtils/calculateAmountForRate'
import { calculateRateForAmount } from 'utils/orderUtils/calculateRateForAmount'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'
import { useUpdateLimitOrdersRawState } from './useLimitOrdersRawState'

import { LimitOrdersRawState } from '../state/limitOrdersRawStateAtom'
import { limitOrdersSettingsAtom } from '../state/limitOrdersSettingsAtom'
import { updateLimitRateAtom } from '../state/limitRateAtom'

type CurrencyAmountProps = {
  activeRate: Fraction | null
  amount: CurrencyAmount<Currency> | null
  orderKind: OrderKind
  isPriceUpdate?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateCurrencyAmount() {
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersDerivedState()
  const updateLimitRateState = useSetAtom(updateLimitRateAtom)
  const { limitPriceLocked } = useAtomValue(limitOrdersSettingsAtom)

  return useCallback(
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line complexity
    (params: CurrencyAmountProps) => {
      const { activeRate, amount, orderKind, isPriceUpdate } = params
      const field = isSellOrder(orderKind) ? Field.INPUT : Field.OUTPUT
      const isBuyAmountChange = field === Field.OUTPUT

      if (!amount || amount.equalTo(0)) {
        updateLimitOrdersState({
          inputCurrencyAmount: null,
          outputCurrencyAmount: null,
        })
        return
      }

      if (!limitPriceLocked && !isPriceUpdate) {
        // Limit price is unlocked, we should not update the opposite amount, only the price!
        const update: Partial<Writeable<LimitOrdersRawState>> = {
          orderKind,
          [isBuyAmountChange ? 'outputCurrencyAmount' : 'inputCurrencyAmount']:
            FractionUtils.serializeFractionToJSON(amount),
        }

        // Update the state right away, but only the amount that was changed
        updateLimitOrdersState(update)

        const newRate = calculateRateForAmount(isBuyAmountChange, amount, inputCurrencyAmount, outputCurrencyAmount)

        if (newRate) {
          updateLimitRateState({
            activeRate: FractionUtils.fractionLikeToFraction(newRate),
            percentageSelection: null,
            isTypedValue: false,
            isRateFromUrl: false,
            isAlternativeOrderRate: false,
          })
          return
        }
      }
      // Price is locked, we should update the opposite amount

      const calculatedAmount = calculateAmountForRate({
        activeRate,
        amount,
        field,
        inputCurrency,
        outputCurrency,
      })

      const newInputAmount = field === Field.INPUT ? amount : calculatedAmount
      const newOutputAmount = field === Field.OUTPUT ? amount : calculatedAmount

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
    [
      inputCurrency,
      outputCurrency,
      updateLimitOrdersState,
      inputCurrencyAmount,
      outputCurrencyAmount,
      limitPriceLocked,
      updateLimitRateState,
    ],
  )
}
