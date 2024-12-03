import { useCallback, useMemo } from 'react'

import { isSellOrder, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/types'

import { TradeWidgetActions, useOnCurrencySelection, useSwitchTokensPlaces } from 'modules/trade'

import { useUpdateCurrencyAmount } from './useUpdateCurrencyAmount'
import { useUpdateYieldRawState } from './useUpdateYieldRawState'
import { useYieldDerivedState } from './useYieldDerivedState'

export function useYieldWidgetActions(): TradeWidgetActions {
  const { inputCurrency, outputCurrency, orderKind } = useYieldDerivedState()
  const updateYieldState = useUpdateYieldRawState()
  const onCurrencySelection = useOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency) || null

      updateCurrencyAmount(field, value)
    },
    [updateCurrencyAmount, inputCurrency, outputCurrency],
  )

  const onSwitchTokens = useSwitchTokensPlaces({
    orderKind: isSellOrder(orderKind) ? OrderKind.BUY : OrderKind.SELL,
  })

  const onChangeRecipient = useCallback(
    (recipient: string | null) => updateYieldState({ recipient }),
    [updateYieldState],
  )

  return useMemo(
    () => ({ onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection }),
    [onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection],
  )
}
