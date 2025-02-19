import { OrderKind } from '@cowprotocol/cow-sdk'
import { InlineBanner, LinkStyledButton } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useDerivedTradeState } from '../../hooks/useDerivedTradeState'
import { useNavigateOnCurrencySelection } from '../../hooks/useNavigateOnCurrencySelection'
import { useWrappedToken } from '../../hooks/useWrappedToken'

const Button = styled(LinkStyledButton)`
  text-decoration: underline;
`

export function SellNativeWarningBanner() {
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()
  const navigateOnCurrencySelection = useNavigateOnCurrencySelection()

  const state = useDerivedTradeState()

  const queryParams = state?.inputCurrencyAmount
    ? {
        kind: OrderKind.SELL,
        amount: state.inputCurrencyAmount.toFixed(state.inputCurrencyAmount.currency.decimals),
      }
    : undefined

  const nativeSymbol = native.symbol || 'native'
  const wrappedNativeSymbol = wrapped.symbol || 'wrapped native'

  return (
    <InlineBanner bannerType="alert" iconSize={32}>
      <strong>Cannot sell {nativeSymbol}</strong>
      <p>Selling {nativeSymbol} is only supported on SWAP orders.</p>
      <p>
        <Button onClick={() => navigateOnCurrencySelection(Field.INPUT, wrapped)}>
          Switch to {wrappedNativeSymbol}
        </Button>
        or
        <Button onClick={() => navigateOnCurrencySelection(Field.OUTPUT, wrapped, undefined, queryParams)}>
          Wrap {nativeSymbol} to {wrappedNativeSymbol}
        </Button>
        first.
      </p>
    </InlineBanner>
  )
}
