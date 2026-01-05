import { Command } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ApprovalState, ApproveRequiredReason } from 'modules/erc20Approve'
import { TradeDerivedState } from 'modules/trade'
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
  BalancesLoading,
  BalancesNotLoaded,
  BalanceInsufficient,

  // Approve
  ApproveAndSwapInBundle,
  ApproveRequired,

  // Intermediate token
  ImportingIntermediateToken,

  // Native - this should be the last validation, as it overrides all other validations
  SellNativeToken,

  // Bridging
  ProxyAccountLoading,
  ProxyAccountUnknown,
  CustomTokenError,

  // RWA/Geo restrictions
  RestrictedForCountry,
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
  isApproveRequired: ApproveRequiredReason
  isInsufficientBalanceOrderAllowed: boolean
  isProviderNetworkUnsupported: boolean
  isOnline: boolean
  intermediateTokenToBeImported: boolean
  isAccountProxyLoading: boolean
  isProxySetupValid: boolean | null | undefined
  customTokenError?: string
  isRestrictedForCountry: boolean
  isBalancesLoading: boolean
}

export interface TradeFormValidationContext extends TradeFormValidationCommonContext {}

export interface TradeFormButtonContext {
  defaultText: string
  amountToApprove: CurrencyAmount<Currency> | null
  derivedState: TradeDerivedState
  quote: TradeQuoteState
  isSupportedWallet: boolean
  widgetStandaloneMode?: boolean
  enablePartialApprove?: boolean
  customTokenError?: string
  minAmountToSignForSwap?: CurrencyAmount<Currency>

  confirmTrade(): void

  connectWallet: Command

  wrapNativeFlow(): void
}
