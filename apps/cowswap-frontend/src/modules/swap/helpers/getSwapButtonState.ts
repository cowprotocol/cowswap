import { Token, TradeType } from '@uniswap/sdk-core'

import { QuoteError } from 'legacy/state/price/actions'
import { QuoteInformationObject } from 'legacy/state/price/reducer'
import TradeGp from 'legacy/state/swap/TradeGp'

import { getEthFlowEnabled } from 'modules/swap/helpers/getEthFlowEnabled'
import { isQuoteExpired, QuoteDeadlineParams } from 'modules/tradeQuote'

import { ApprovalState } from 'common/hooks/useApproveState'

export enum SwapButtonState {
  SwapIsUnsupported = 'SwapIsUnsupported',
  WalletIsUnsupported = 'WalletIsUnsupported',
  FeesExceedFromAmount = 'FeesExceedFromAmount',
  InsufficientLiquidity = 'InsufficientLiquidity',
  ZeroPrice = 'ZeroPrice',
  TransferToSmartContract = 'TransferToSmartContract',
  UnsupportedToken = 'UnsupportedToken',
  FetchQuoteError = 'FetchQuoteError',
  QuoteExpired = 'QuoteExpired',
  OfflineBrowser = 'OfflineBrowser',
  Loading = 'Loading',
  WalletIsNotConnected = 'WalletIsNotConnected',
  ReadonlyGnosisSafeUser = 'ReadonlyGnosisSafeUser',
  NeedApprove = 'NeedApprove',
  SwapDisabled = 'SwapDisabled',
  SwapError = 'SwapError',
  RegularSwap = 'RegularSwap',
  SwapWithWrappedToken = 'SwapWithWrappedToken',
  RegularEthFlowSwap = 'EthFlowSwap',
  ApproveAndSwap = 'ApproveAndSwap',

  WrapAndSwap = 'WrapAndSwap',
}

export interface SwapButtonStateParams {
  trade: TradeGp | undefined | null
  quoteError: QuoteError | undefined | null
  account: string | undefined
  isSupportedWallet: boolean
  isReadonlyGnosisSafeUser: boolean
  isSwapUnsupported: boolean
  isBundlingSupported: boolean
  quote: QuoteInformationObject | undefined | null
  inputError?: string
  approvalState: ApprovalState
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  isGettingNewQuote: boolean
  swapCallbackError: string | null
  isNativeIn: boolean
  isSmartContractWallet: boolean | undefined
  isBestQuoteLoading: boolean
  wrappedToken: Token
  isPermitSupported: boolean
  quoteDeadlineParams: QuoteDeadlineParams
}

const quoteErrorToSwapButtonState: { [key in QuoteError]: SwapButtonState | null } = {
  'fee-exceeds-sell-amount': SwapButtonState.FeesExceedFromAmount,
  'insufficient-liquidity': SwapButtonState.InsufficientLiquidity,
  'zero-price': SwapButtonState.ZeroPrice,
  'transfer-eth-to-smart-contract': SwapButtonState.TransferToSmartContract,
  'fetch-quote-error': SwapButtonState.FetchQuoteError,
  'offline-browser': SwapButtonState.OfflineBrowser,
  'unsupported-token': SwapButtonState.UnsupportedToken,
}

export function getSwapButtonState(input: SwapButtonStateParams): SwapButtonState {
  const { trade, quote, approvalState, isPermitSupported } = input
  const quoteError = quote?.error

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold
  const showApproveFlow =
    !isPermitSupported &&
    !input.inputError &&
    (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

  const isValid = !input.inputError && input.feeWarningAccepted && input.impactWarningAccepted
  const swapBlankState = !input.inputError && !trade

  const isSellOrder = trade?.tradeType === TradeType.EXACT_INPUT
  const amountAfterFees = isSellOrder ? trade?.outputAmountAfterFees : trade?.inputAmountAfterFees

  if (quoteError) {
    const quoteErrorState = quoteErrorToSwapButtonState[quoteError]

    if (quoteErrorState) return quoteErrorState
  }

  if (input.isSwapUnsupported) {
    return SwapButtonState.SwapIsUnsupported
  }

  if (!input.account) {
    return SwapButtonState.WalletIsNotConnected
  }

  if (!input.isSupportedWallet) {
    return SwapButtonState.WalletIsUnsupported
  }

  if (swapBlankState || input.isGettingNewQuote || input.isBestQuoteLoading) {
    return SwapButtonState.Loading
  }

  if (input.isReadonlyGnosisSafeUser) {
    return SwapButtonState.ReadonlyGnosisSafeUser
  }

  if (
    isQuoteExpired({
      expirationDate: quote?.fee?.expirationDate,
      deadlineParams: input.quoteDeadlineParams,
    }) &&
    trade &&
    !input.inputError
  ) {
    return SwapButtonState.QuoteExpired
  }

  if (!input.isNativeIn && showApproveFlow) {
    if (input.isBundlingSupported) {
      return SwapButtonState.ApproveAndSwap
    }
    return SwapButtonState.NeedApprove
  }

  if (input.inputError) {
    return SwapButtonState.SwapError
  }

  if (amountAfterFees && (amountAfterFees.equalTo(0) || amountAfterFees.lessThan(0))) {
    return SwapButtonState.FeesExceedFromAmount
  }

  if (!isValid || !!input.swapCallbackError) {
    return SwapButtonState.SwapDisabled
  }

  if (input.isNativeIn) {
    if (getEthFlowEnabled(input.isSmartContractWallet === true)) {
      return SwapButtonState.RegularEthFlowSwap
    } else if (input.isBundlingSupported) {
      return SwapButtonState.WrapAndSwap
    } else {
      return SwapButtonState.SwapWithWrappedToken
    }
  }

  return SwapButtonState.RegularSwap
}
