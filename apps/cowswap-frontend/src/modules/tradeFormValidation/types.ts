import { Command } from '@cowprotocol/types'

import { TradeDerivedState, AmountsToSign } from 'modules/trade'
import { TradeQuoteState } from 'modules/tradeQuote'

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
  NetworkNotSupported,
  BrowserOffline,

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
  isApprovalRequired: boolean
  tradeQuote: TradeQuoteState
  recipientEnsAddress: string | null
  isWrapUnwrap: boolean
  isBundlingSupported: boolean
  isSupportedWallet: boolean
  isSwapUnsupported: boolean
  isSafeReadonlyUser: boolean
  isInsufficientBalanceOrderAllowed: boolean
  isProviderNetworkUnsupported: boolean
  isOnline: boolean
}

export interface TradeFormValidationContext extends TradeFormValidationCommonContext {}

export interface TradeFormButtonContext {
  defaultText: string
  amountsToSign: AmountsToSign | null
  derivedState: TradeDerivedState
  quote: TradeQuoteState
  isSupportedWallet: boolean
  widgetStandaloneMode?: boolean

  confirmTrade(): void
  connectWallet: Command
  wrapNativeFlow(): void
}
