import { OrderKind } from '@cowprotocol/cow-sdk'
import { InlineBanner, LinkStyledButton, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { Field } from 'legacy/state/types'

import { useDerivedTradeState, useNavigateOnCurrencySelection, useWrappedToken } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

const Button = styled(LinkStyledButton)`
  text-decoration: underline;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SellNativeWarningBanner() {
  const { account } = useWalletInfo()
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

  if (!account) return null

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} iconSize={32}>
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
