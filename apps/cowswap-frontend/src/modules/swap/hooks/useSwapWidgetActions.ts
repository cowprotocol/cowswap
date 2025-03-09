import { useCallback, useMemo } from 'react'

import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'

import { Field } from 'legacy/state/types'

import { TradeWidgetActions } from 'modules/trade'

import { useOnCurrencySelection } from './useOnCurrencySelection'
import { useOnSwitchTokens } from './useOnSwitchTokens'
import { useSwapDerivedState } from './useSwapDerivedState'
import { useUpdateCurrencyAmount } from './useUpdateCurrencyAmount'
import { useUpdateSwapRawState } from './useUpdateSwapRawState'

export function useSwapWidgetActions(): TradeWidgetActions {
  const { inputCurrency, outputCurrency } = useSwapDerivedState()
  const updateSwapState = useUpdateSwapRawState()
  const onCurrencySelection = useOnCurrencySelection()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const onUserInput = useCallback(
    (field: Field, typedValue: string | undefined) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency)

      updateCurrencyAmount(field, value)
    },
    [updateCurrencyAmount, inputCurrency, outputCurrency],
  )

  const onSwitchTokens = useOnSwitchTokens()

  const onChangeRecipient = useCallback((recipient: string | null) => updateSwapState({ recipient }), [updateSwapState])

  return useMemo(
    () => ({ onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection }),
    [onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection],
  )
}
