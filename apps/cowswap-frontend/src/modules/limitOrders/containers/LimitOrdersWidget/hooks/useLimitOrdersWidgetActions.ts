import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { isSellOrder, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/types'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useUpdateCurrencyAmount } from 'modules/limitOrders/hooks/useUpdateCurrencyAmount'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { TradeWidgetActions } from 'modules/trade'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useOnCurrencySelection } from 'modules/trade/hooks/useOnCurrencySelection'
import { useSwitchTokensPlaces } from 'modules/trade/hooks/useSwitchTokensPlaces'
import { createDebouncedTradeAmountAnalytics } from 'modules/trade/utils/analytics'

export function useLimitOrdersWidgetActions(): TradeWidgetActions {
  const { inputCurrency, outputCurrency, orderKind } = useLimitOrdersDerivedState()
  const { activeRate } = useAtomValue(limitRateAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const cowAnalytics = useCowAnalytics()
  const debouncedTradeAmountAnalytics = useMemo(() => createDebouncedTradeAmountAnalytics(cowAnalytics), [cowAnalytics])

  const updateLimitOrdersState = useUpdateLimitOrdersRawState()

  const onCurrencySelection = useOnCurrencySelection()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency)

      debouncedTradeAmountAnalytics([field, Number(typedValue)])

      updateCurrencyAmount({
        activeRate,
        amount: value,
        orderKind: isWrapOrUnwrap || field === Field.INPUT ? OrderKind.SELL : OrderKind.BUY,
      })
    },
    [updateCurrencyAmount, isWrapOrUnwrap, inputCurrency, outputCurrency, activeRate, debouncedTradeAmountAnalytics],
  )

  const stateOverride = useMemo(
    () => ({
      orderKind: isSellOrder(orderKind) ? OrderKind.BUY : OrderKind.SELL,
    }),
    [orderKind],
  )

  const onSwitchTokens = useSwitchTokensPlaces(stateOverride)

  const onChangeRecipient = useCallback(
    (recipient: string | null) => updateLimitOrdersState({ recipient }),
    [updateLimitOrdersState],
  )

  return useMemo(
    () => ({ onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection }),
    [onUserInput, onSwitchTokens, onChangeRecipient, onCurrencySelection],
  )
}
