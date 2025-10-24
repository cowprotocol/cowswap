import { OrderKind } from '@cowprotocol/cow-sdk'
import { InlineBanner, LinkStyledButton, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
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

  const nativeSymbol = native.symbol || t`native`
  const wrappedNativeSymbol = wrapped.symbol || t`wrapped native`

  if (!account) return null

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} iconSize={32}>
      <strong>
        <Trans>Cannot sell {nativeSymbol}</Trans>
      </strong>
      <p>
        <Trans>Selling {nativeSymbol} is only supported on SWAP orders.</Trans>
      </p>
      <p>
        <Button onClick={() => navigateOnCurrencySelection(Field.INPUT, wrapped)}>
          <Trans>Switch to {wrappedNativeSymbol}</Trans>
        </Button>
        <Trans>or</Trans>
        <Button onClick={() => navigateOnCurrencySelection(Field.OUTPUT, wrapped, undefined, queryParams)}>
          <Trans>
            Wrap {nativeSymbol} to {wrappedNativeSymbol}
          </Trans>
        </Button>
        <Trans>first.</Trans>
      </p>
    </InlineBanner>
  )
}
