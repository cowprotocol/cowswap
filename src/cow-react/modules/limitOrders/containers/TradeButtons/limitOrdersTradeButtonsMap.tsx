import React from 'react'
import { LimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { LimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { ButtonSize } from 'theme'
import { TradeApproveButton } from '@cow/common/containers/TradeApprove/TradeApproveButton'
import { LimitOrdersQuoteState } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { GpQuoteErrorCodes } from '@cow/api/gnosisProtocol/errors/QuoteError'

export interface TradeButtonsParams {
  tradeState: LimitOrdersTradeState
  quote: LimitOrdersQuoteState
  toggleWalletModal: () => void
}

interface ButtonConfig {
  disabled: boolean
  text: string
}

interface ButtonCallback {
  (params: TradeButtonsParams): JSX.Element | null
}

export function SwapButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled: boolean
  onClick?: () => void
}) {
  return (
    <ButtonPrimary onClick={onClick} disabled={disabled} buttonSize={ButtonSize.BIG}>
      <Trans>{children}</Trans>
    </ButtonPrimary>
  )
}

const quoteErrorTexts: { [key in GpQuoteErrorCodes]: string } = {
  [GpQuoteErrorCodes.UNHANDLED_ERROR]: 'Unhandled error',
  [GpQuoteErrorCodes.TransferEthToContract]:
    'Buying native currency with smart contract wallets is not currently supported',
  [GpQuoteErrorCodes.UnsupportedToken]: 'Unsupported token',
  [GpQuoteErrorCodes.InsufficientLiquidity]: 'Insufficient liquidity for this trade.',
  [GpQuoteErrorCodes.FeeExceedsFrom]: 'Fees exceed from amount',
  [GpQuoteErrorCodes.ZeroPrice]: 'Invalid price. Try increasing input/output amount.',
}

export const limitOrdersTradeButtonsMap: { [key in LimitOrdersFormState]: ButtonConfig | ButtonCallback } = {
  [LimitOrdersFormState.Loading]: {
    disabled: true,
    text: 'Loading...',
  },
  [LimitOrdersFormState.CanTrade]: {
    disabled: false,
    text: 'Review limit order',
  },
  // [LimitOrdersFormState.SwapIsUnsupported]: {
  //   disabled: true,
  //   text: 'Unsupported Token',
  // },
  [LimitOrdersFormState.WalletIsUnsupported]: {
    disabled: true,
    text: 'Wallet Unsupported',
  },
  [LimitOrdersFormState.ReadonlyGnosisSafeUser]: {
    disabled: true,
    text: 'Read Only',
  },
  [LimitOrdersFormState.NeedToSelectToken]: {
    disabled: true,
    text: 'Select a token',
  },
  [LimitOrdersFormState.AmountIsNotSet]: {
    disabled: true,
    text: 'Enter an amount',
  },
  [LimitOrdersFormState.InvalidRecipient]: {
    disabled: true,
    text: 'Enter a recipient',
  },
  [LimitOrdersFormState.CantLoadBalances]: {
    disabled: true,
    text: "Couldn't load balances",
  },
  [LimitOrdersFormState.QuoteError]: ({ quote }: TradeButtonsParams) => {
    return (
      <SwapButton disabled={true}>
        <Trans>{quote.error ? quoteErrorTexts[quote.error.type] : 'Unknown error'}</Trans>
      </SwapButton>
    )
  },
  [LimitOrdersFormState.InsufficientBalance]: ({ tradeState }: TradeButtonsParams) => {
    return (
      <SwapButton disabled={true}>
        <Trans>Insufficient {tradeState.inputCurrency?.symbol} balance</Trans>
      </SwapButton>
    )
  },
  [LimitOrdersFormState.WalletIsNotConnected]: ({ toggleWalletModal }: TradeButtonsParams) => {
    return (
      <SwapButton disabled={false} onClick={toggleWalletModal}>
        <Trans>Connect Wallet</Trans>
      </SwapButton>
    )
  },
  [LimitOrdersFormState.NotApproved]: ({ tradeState }: TradeButtonsParams) => {
    const amountToApprove = tradeState.inputCurrencyAmount

    return (
      <>
        {!!amountToApprove && (
          <TradeApproveButton amountToApprove={amountToApprove}>
            <SwapButton disabled={true}>
              <Trans>Review limit order</Trans>
            </SwapButton>
          </TradeApproveButton>
        )}
      </>
    )
  },
}
