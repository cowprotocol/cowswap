import { Currency } from '@uniswap/sdk-core'
import { useIsSwapUnsupported } from 'hooks/useIsSwapUnsupported'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useDetectNativeToken } from 'state/swap/hooks'
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
  walletIsSupported,
  shouldWrapNativeToken,
  shouldUnwrapNativeToken,
  switchToWeth,
  feesExceedFromAmount,
  insufficientLiquidity,
  zeroPrice,
  transferToSmartContract,
  fetchQuoteError,
  offlineBrowser,
  walletIsNotConnected,
  readonlyGnosisSafeUser,
  needApprove,
  swapDisabled,
  swapError,
  expertModeSwap,
  regularSwap,
  loading,
}

export interface SwapButtonStateInput {
  inputCurrencyId: string | undefined
  outputCurrencyId: string | undefined
  currencyIn: Currency | null
  currencyOut: Currency | null
  wrapType: WrapType
  quoteError: QuoteError | null
  inputError?: ReactNode
  approvalState: ApprovalState
  approvalSubmitted: boolean
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  isGettingNewQuote: boolean
  swapCallbackError: string | null
  trade: TradeGp | null
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
    inputCurrencyId,
    outputCurrencyId,
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
  } = input

  const { chainId, account } = useWeb3React()
  const { isSupportedWallet } = useWalletInfo()
  const { isNativeIn } = useDetectNativeToken(
    { currency: currencyIn, address: inputCurrencyId },
    { currency: currencyOut, address: outputCurrencyId },
    chainId
  )
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

  if (isSupportedWallet) {
    return SwapButtonState.walletIsSupported
  }

  if (showWrap) {
    if (wrapType === WrapType.WRAP) {
      return SwapButtonState.shouldWrapNativeToken
    }

    if (wrapType === WrapType.UNWRAP) {
      return SwapButtonState.shouldUnwrapNativeToken
    }
  }

  if (!inputError && isNativeIn) {
    return SwapButtonState.switchToWeth
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

  if (showApproveFlow) {
    return SwapButtonState.needApprove
  }

  if (inputError) {
    return SwapButtonState.swapError
  }

  if (!isValid || !!swapCallbackError) {
    return SwapButtonState.swapDisabled
  }

  if (isExpertMode) {
    return SwapButtonState.expertModeSwap
  }

  return SwapButtonState.regularSwap
}
