import { OrderKind } from '@cowprotocol/cow-sdk'
import { SellNativeWarningBanner as Pure } from '@cowprotocol/ui'

import { Field } from 'legacy/state/types'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useNavigateOnCurrencySelection } from '../../hooks/useNavigateOnCurrencySelection'
import { useWrappedToken } from '../../hooks/useWrappedToken'

export function SellNativeWarningBanner() {
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()
  const navigateOnCurrencySelection = useNavigateOnCurrencySelection()

  const { state } = useDerivedTradeState()

  const queryParams = state?.inputCurrencyAmount
    ? {
        kind: OrderKind.SELL,
        amount: state.inputCurrencyAmount.toFixed(state.inputCurrencyAmount.currency.decimals),
      }
    : undefined

  return (
    <Pure
      nativeSymbol={native.symbol}
      wrappedNativeSymbol={wrapped.symbol}
      sellWrapped={() => navigateOnCurrencySelection(Field.INPUT, wrapped)}
      wrapNative={() => navigateOnCurrencySelection(Field.OUTPUT, wrapped, undefined, queryParams)}
    />
  )
}
