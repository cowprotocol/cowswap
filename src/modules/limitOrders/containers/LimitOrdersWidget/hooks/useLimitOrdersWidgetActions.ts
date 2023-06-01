import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/swap/actions'

import { updateLimitOrdersRawStateAtom } from 'modules/limitOrders'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useUpdateCurrencyAmount } from 'modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { TradeWidgetActions } from 'modules/trade'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useOnCurrencySelection } from 'modules/trade/hooks/useOnCurrencySelection'
import { useSwitchTokensPlaces } from 'modules/trade/hooks/useSwitchTokensPlaces'

import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

export function useLimitOrdersWidgetActions(): TradeWidgetActions {
  const { inputCurrency, outputCurrency, orderKind } = useLimitOrdersDerivedState()
  const { activeRate } = useAtomValue(limitRateAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)

  const onCurrencySelection = useOnCurrencySelection()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency) || null

      updateCurrencyAmount({
        activeRate,
        amount: value,
        orderKind: isWrapOrUnwrap || field === Field.INPUT ? OrderKind.SELL : OrderKind.BUY,
      })
    },
    [updateCurrencyAmount, isWrapOrUnwrap, inputCurrency, outputCurrency, activeRate]
  )

  const onSwitchTokens = useSwitchTokensPlaces({
    orderKind: orderKind === OrderKind.SELL ? OrderKind.BUY : OrderKind.SELL,
  })

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateLimitOrdersState({ recipient })
    },
    [updateLimitOrdersState]
  )

  return { onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection }
}
