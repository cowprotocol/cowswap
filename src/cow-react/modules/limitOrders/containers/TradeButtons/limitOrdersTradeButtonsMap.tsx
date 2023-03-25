import React from 'react'
import { LimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { LimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { ButtonSize } from 'theme/enum'
import { TradeApproveButton } from '@cow/common/containers/TradeApprove/TradeApproveButton'
import { LimitOrdersQuoteState } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { GpQuoteErrorCodes } from '@cow/api/gnosisProtocol/errors/QuoteError'
import { WrapUnwrapCallback } from 'hooks/useWrapCallback'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { TransactionConfirmState } from '@cow/modules/swap/state/transactionConfirmAtom'
import { TradeLoadingButton } from '@cow/modules/trade/pure/TradeLoadingButton'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

export interface WrapUnwrapParams {
  isNativeIn: boolean
  wrapUnwrapCallback: WrapUnwrapCallback | null
  transactionConfirmState: TransactionConfirmState
  closeModals(): void
  showTransactionConfirmationModal: boolean
}

export interface TradeButtonsParams {
  tradeState: LimitOrdersTradeState
  quote: LimitOrdersQuoteState
  toggleWalletModal: () => void
  wrapUnwrapParams: WrapUnwrapParams
}

interface ButtonConfig {
  disabled: boolean
  text: string
  id?: string
}

interface ButtonCallback {
  (params: TradeButtonsParams): JSX.Element | null
}

export function SwapButton({
  children,
  disabled,
  onClick,
  id,
}: {
  children: React.ReactNode
  disabled: boolean
  onClick?: () => void
  id?: string
}) {
  return (
    <ButtonPrimary
      id={id}
      fontSize={'16px !important'}
      onClick={onClick}
      disabled={disabled}
      buttonSize={ButtonSize.BIG}
    >
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
  [GpQuoteErrorCodes.FeeExceedsFrom]: 'Sell amount is too small',
  [GpQuoteErrorCodes.ZeroPrice]: 'Invalid price. Try increasing input/output amount.',
}

export const limitOrdersTradeButtonsMap: { [key in LimitOrdersFormState]: ButtonConfig | ButtonCallback } = {
  [LimitOrdersFormState.Loading]: () => (
    <SwapButton disabled={true}>
      <TradeLoadingButton />
    </SwapButton>
  ),
  [LimitOrdersFormState.CanTrade]: {
    disabled: false,
    text: 'Review limit order',
    id: 'review-limit-order-btn',
  },
  [LimitOrdersFormState.SwapIsUnsupported]: {
    disabled: true,
    text: 'Unsupported token',
  },
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
  [LimitOrdersFormState.PriceIsNotSet]: {
    disabled: true,
    text: 'Enter a price',
  },
  [LimitOrdersFormState.InvalidRecipient]: {
    disabled: true,
    text: 'Enter a recipient',
  },
  [LimitOrdersFormState.CantLoadBalances]: {
    disabled: true,
    text: "Couldn't load balances",
  },
  [LimitOrdersFormState.ZeroPrice]: {
    disabled: true,
    text: 'Invalid price. Try increasing input/output amount.',
  },
  [LimitOrdersFormState.QuoteError]: ({ quote }: TradeButtonsParams) => {
    return (
      <SwapButton disabled={true}>
        <Trans>
          {quote.error ? quoteErrorTexts[quote.error.type] || 'Error loading price. Try again later.' : 'Unknown error'}
        </Trans>
      </SwapButton>
    )
  },
  [LimitOrdersFormState.InsufficientBalance]: ({ tradeState }: TradeButtonsParams) => {
    return (
      <SwapButton disabled={true}>
        <Trans>Insufficient&nbsp;{<TokenSymbol token={tradeState.inputCurrency} />}&nbsp;balance</Trans>
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
  [LimitOrdersFormState.WrapUnwrap]: ({ wrapUnwrapParams }: TradeButtonsParams) => {
    const {
      isNativeIn,
      wrapUnwrapCallback,
      transactionConfirmState: { pendingText, operationType },
      closeModals,
      showTransactionConfirmationModal,
    } = wrapUnwrapParams

    return (
      <>
        <SwapButton disabled={false} onClick={() => wrapUnwrapCallback?.({ useModals: true })}>
          <Trans>{isNativeIn ? 'Wrap' : 'Unwrap'}</Trans>
        </SwapButton>
        <TransactionConfirmationModal
          attemptingTxn={true}
          isOpen={showTransactionConfirmationModal}
          pendingText={pendingText}
          onDismiss={closeModals}
          operationType={operationType}
        />
      </>
    )
  },
}
