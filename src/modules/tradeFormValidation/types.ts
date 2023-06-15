import { ApprovalState } from 'legacy/hooks/useApproveCallback'

import { TradeDerivedState } from 'modules/trade'
import { TradeQuoteState } from 'modules/tradeQuote'

export enum TradeFormValidation {
  // Wrap/unwrap
  WrapUnwrapAmountNotSet,
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

  // Balances
  BalancesNotLoaded,
  BalanceInsufficient,

  // Approve
  ExpertApproveAndSwap,
  ApproveAndSwap,
  ApproveRequired,
}

export interface TradeFormValidationLocalContext {
  isExpertMode: boolean
}

export interface TradeFormValidationCommonContext {
  account: string | undefined
  derivedTradeState: TradeDerivedState
  approvalState: ApprovalState
  tradeQuote: TradeQuoteState
  recipientEnsAddress: string | null
  isWrapUnwrap: boolean
  isTxBundlingEnabled: boolean
  isSupportedWallet: boolean
  isSwapUnsupported: boolean
  isSafeReadonlyUser: boolean
}

export interface TradeFormValidationContext extends TradeFormValidationLocalContext, TradeFormValidationCommonContext {}

export interface TradeFormButtonContext {
  defaultText: string
  derivedState: TradeDerivedState
  quote: TradeQuoteState
  isSupportedWallet: boolean

  doTrade(): void
  confirmTrade(): void
  connectWallet(): void
  wrapNativeFlow(): void
}
