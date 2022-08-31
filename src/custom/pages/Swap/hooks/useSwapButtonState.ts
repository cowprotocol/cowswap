import { Currency, Token } from '@uniswap/sdk-core'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useWeb3React } from '@web3-react/core'
import { WrapType } from 'hooks/useWrapCallback'
import { ReactNode } from 'react'
import { QuoteError } from 'state/price/actions'
import { useGnosisSafeInfo } from 'hooks/useGnosisSafeInfo'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useExpertModeManager } from '@src/state/user/hooks'
import TradeGp from 'state/swap/TradeGp'

export enum SwapButtonState {
  swapIsUnsupported,
  walletIsUnsupported,
  wrapError,
  shouldWrapNativeToken,
  shouldUnwrapNativeToken,
  feesExceedFromAmount,
  insufficientLiquidity,
  zeroPrice,
  transferToSmartContract,
  fetchQuoteError,
  offlineBrowser,
  loading,
  walletIsNotConnected,
  readonlyGnosisSafeUser,
  needApprove,
  swapDisabled,
  swapError,
  expertModeSwap,
  regularSwap,
  swapWithWrappedToken,
  wrapAndSwap,
}

export interface SwapButtonStateInput {
  currencyIn: Currency | undefined | null
  currencyOut: Currency | undefined | null
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

export function useSwapButtonState(input: SwapButtonStateInput): SwapButtonState {
  const {
    currencyIn,
    currencyOut,
    wrapType,
    inputError,
    quoteError,
    approvalState,
    approvalSubmitted,
    feeWarningAccepted,
    impactWarningAccepted,
    swapCallbackError,
    trade,
    isGettingNewQuote,
    wrapInputError,
    isNativeIn,
    wrappedToken,
  } = input

  const { account } = useWeb3React()
  const { isSupportedWallet } = useWalletInfo()
  const isReadonlyGnosisSafeUser = useGnosisSafeInfo()?.isReadOnly || false
  const [isExpertMode] = useExpertModeManager()
  const isSwapSupported = useIsSwapUnsupported(currencyIn, currencyOut)

  const showWrap = !isNativeIn && wrapType !== WrapType.NOT_APPLICABLE

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !inputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED))

  const isValid = !inputError && feeWarningAccepted && impactWarningAccepted
  const swapBlankState = !inputError && !trade

  if (isSwapSupported) {
    return SwapButtonState.swapIsUnsupported
  }

  if (!isSupportedWallet) {
    return SwapButtonState.walletIsUnsupported
  }

  // TODO: check
  if (showWrap) {
    if (wrapInputError) {
      return SwapButtonState.wrapError
    }

    if (wrapType === WrapType.WRAP) {
      return SwapButtonState.shouldWrapNativeToken
    }

    if (wrapType === WrapType.UNWRAP) {
      return SwapButtonState.shouldUnwrapNativeToken
    }
  }

  if (quoteError) {
    const quoteErrorState = quoteErrorToSwapButtonState[quoteError]

    if (quoteErrorState) return quoteErrorState
  }

  if (swapBlankState || isGettingNewQuote) {
    return SwapButtonState.loading
  }

  if (!account) {
    return SwapButtonState.walletIsNotConnected
  }

  if (isReadonlyGnosisSafeUser) {
    return SwapButtonState.readonlyGnosisSafeUser
  }

  if (!isNativeIn && showApproveFlow) {
    return SwapButtonState.needApprove
  }

  if (inputError) {
    return SwapButtonState.swapError
  }

  if (!isValid || !!swapCallbackError) {
    return SwapButtonState.swapDisabled
  }

  if (isNativeIn) {
    if (wrappedToken.symbol) {
      return SwapButtonState.swapWithWrappedToken
    }

    return SwapButtonState.wrapAndSwap
  }

  if (isExpertMode) {
    return SwapButtonState.expertModeSwap
  }

  return SwapButtonState.regularSwap
}
