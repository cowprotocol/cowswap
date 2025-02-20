import { Command } from '@cowprotocol/types'

import { ReceiveAmountInfo, TradeDerivedState } from 'modules/trade'
import { TradeQuoteState } from 'modules/tradeQuote'

import { ApprovalState } from 'common/hooks/useApproveState'

export enum TradeFormValidation {
  // Wrap/unwrap
  WrapUnwrapFlow,

  // Quote errors
  QuoteErrors,
  CurrencyNotSupported,

  // Wallet
  WalletNotConnected,
  WalletNotSupported,
  SafeReadonlyUser,

  // Quote request params
  CurrencyNotSet,
  InputAmountNotSet,
  RecipientInvalid,

  // Quote loading indicator
  QuoteLoading,
  QuoteExpired,

  // Balances
  BalancesNotLoaded,
  BalanceInsufficient,

  // Approve
  ApproveAndSwap,
  ApproveRequired,

  // Native
  SellNativeToken,
}

export interface TradeFormValidationCommonContext {
  account: string | undefined
  derivedTradeState: TradeDerivedState
  approvalState: ApprovalState
  tradeQuote: TradeQuoteState
  recipientEnsAddress: string | null
  isWrapUnwrap: boolean
  isBundlingSupported: boolean
  isSupportedWallet: boolean
  isSwapUnsupported: boolean
  isSafeReadonlyUser: boolean
  isPermitSupported: boolean
  isInsufficientBalanceOrderAllowed: boolean
}

export interface TradeFormValidationContext extends TradeFormValidationCommonContext {}

export interface TradeFormButtonContext {
  defaultText: string
  receiveAmountInfo: ReceiveAmountInfo
  quote: TradeQuoteState
  isSupportedWallet: boolean
  widgetStandaloneMode?: boolean

  confirmTrade(): void
  connectWallet: Command
  wrapNativeFlow(): void
}
