import { Token } from '@uniswap/sdk-core'
import { WrapType } from '@src/hooks/useWrapCallback'
import { ReactNode } from 'react'
import { QuoteError } from 'state/price/actions'
import { ApprovalState } from '@src/hooks/useApproveCallback'
import TradeGp from 'state/swap/TradeGp'

export enum SwapButtonState {
  swapIsUnsupported = 'swapIsUnsupported',
  walletIsUnsupported = 'walletIsUnsupported',
  wrapError = 'wrapError',
  shouldWrapNativeToken = 'shouldWrapNativeToken',
  shouldUnwrapNativeToken = 'shouldUnwrapNativeToken',
  feesExceedFromAmount = 'feesExceedFromAmount',
  insufficientLiquidity = 'insufficientLiquidity',
  zeroPrice = 'zeroPrice',
  transferToSmartContract = 'transferToSmartContract',
  fetchQuoteError = 'fetchQuoteError',
  offlineBrowser = 'offlineBrowser',
  loading = 'loading',
  walletIsNotConnected = 'walletIsNotConnected',
  readonlyGnosisSafeUser = 'readonlyGnosisSafeUser',
  needApprove = 'needApprove',
  swapDisabled = 'swapDisabled',
  swapError = 'swapError',
  expertModeSwap = 'expertModeSwap',
  regularSwap = 'regularSwap',
  swapWithWrappedToken = 'swapWithWrappedToken',
  wrapAndSwap = 'wrapAndSwap',
}

export interface SwapButtonStateInput {
  account: string | undefined
  isSupportedWallet: boolean
  isReadonlyGnosisSafeUser: boolean
  isExpertMode: boolean
  isSwapSupported: boolean
  wrapType: WrapType
  wrapInputError: string | undefined
  quoteError: QuoteError | undefined | null
  inputError?: ReactNode
  approvalState: ApprovalState
  approvalSubmitted: boolean
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  isGettingNewQuote: boolean
  swapCallbackError: string | null
  trade: TradeGp | undefined | null
  isNativeIn: boolean
  wrappedToken: Token
}

const quoteErrorToSwapButtonState: { [key in QuoteError]: SwapButtonState | null } = {
  'fee-exceeds-sell-amount': SwapButtonState.feesExceedFromAmount,
  'insufficient-liquidity': SwapButtonState.insufficientLiquidity,
  'zero-price': SwapButtonState.zeroPrice,
  'transfer-eth-to-smart-contract': SwapButtonState.transferToSmartContract,
  'fetch-quote-error': SwapButtonState.fetchQuoteError,
  'offline-browser': SwapButtonState.offlineBrowser,
  'unsupported-token': null,
}

export function getSwapButtonState(input: SwapButtonStateInput): SwapButtonState {
  const { wrapType, quoteError, approvalState } = input

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !input.inputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (input.approvalSubmitted && approvalState === ApprovalState.APPROVED))

  const isValid = !input.inputError && input.feeWarningAccepted && input.impactWarningAccepted
  const swapBlankState = !input.inputError && !input.trade

  if (input.isSwapSupported) {
    return SwapButtonState.swapIsUnsupported
  }

  if (!input.isSupportedWallet) {
    return SwapButtonState.walletIsUnsupported
  }

  if (wrapType !== WrapType.NOT_APPLICABLE && input.wrapInputError) {
    return SwapButtonState.wrapError
  }

  if (wrapType === WrapType.WRAP) {
    return SwapButtonState.shouldWrapNativeToken
  }

  if (wrapType === WrapType.UNWRAP) {
    return SwapButtonState.shouldUnwrapNativeToken
  }

  if (quoteError) {
    const quoteErrorState = quoteErrorToSwapButtonState[quoteError]

    if (quoteErrorState) return quoteErrorState
  }

  if (swapBlankState || input.isGettingNewQuote) {
    return SwapButtonState.loading
  }

  if (!input.account) {
    return SwapButtonState.walletIsNotConnected
  }

  if (input.isReadonlyGnosisSafeUser) {
    return SwapButtonState.readonlyGnosisSafeUser
  }

  if (!input.isNativeIn && showApproveFlow) {
    return SwapButtonState.needApprove
  }

  if (input.inputError) {
    return SwapButtonState.swapError
  }

  if (!isValid || !!input.swapCallbackError) {
    return SwapButtonState.swapDisabled
  }

  if (input.isNativeIn) {
    if (input.wrappedToken.symbol) {
      return SwapButtonState.swapWithWrappedToken
    }

    return SwapButtonState.wrapAndSwap
  }

  if (input.isExpertMode) {
    return SwapButtonState.expertModeSwap
  }

  return SwapButtonState.regularSwap
}
