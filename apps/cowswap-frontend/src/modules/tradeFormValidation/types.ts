import { Command } from '@cowprotocol/types'

import { TradeDerivedState } from 'modules/trade'
import { TradeQuoteState } from 'modules/tradeQuote'

import { ApprovalState } from 'common/hooks/useApproveState'

import { AmountsToSign } from '../trade/hooks/useAmountsToSign'

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

  // Intermediate token
  ImportingIntermediateToken,

  // Native - this should be the last validation, as it overrides all other validations
  SellNativeToken,

  // Bridging
  ProxyAccountLoading,
  ProxyAccountUnknown,
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
  isProviderNetworkUnsupported: boolean
  isOnline: boolean
  intermediateTokenToBeImported: boolean
  isAccountProxyLoading: boolean
  isProxySetupValid: boolean | null | undefined
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
