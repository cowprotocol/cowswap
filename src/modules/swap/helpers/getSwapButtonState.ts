import { Token } from '@uniswap/sdk-core'

import { ApprovalState } from 'legacy/hooks/useApproveCallback'
import { WrapType } from 'legacy/hooks/useWrapCallback'
import { QuoteError } from 'legacy/state/price/actions'
import TradeGp from 'legacy/state/swap/TradeGp'

import { getEthFlowEnabled } from 'modules/swap/helpers/getEthFlowEnabled'

export enum SwapButtonState {
  Loading = 'Loading',
  SwapIsUnsupported = 'SwapIsUnsupported',
  WalletIsUnsupported = 'WalletIsUnsupported',
  NeedApprove = 'NeedApprove',
  WalletIsNotConnected = 'WalletIsNotConnected',
  ReadonlyGnosisSafeUser = 'ReadonlyGnosisSafeUser',
  FeesExceedFromAmount = 'FeesExceedFromAmount',

  ApproveAndSwap = 'ApproveAndSwap',
  ExpertApproveAndSwap = 'ExpertApproveAndSwap',

  ShouldWrapNativeToken = 'ShouldWrapNativeToken',
  ShouldUnwrapNativeToken = 'ShouldUnwrapNativeToken',
  WrapError = 'WrapError',

  FetchQuoteError = 'FetchQuoteError',
  TransferToSmartContract = 'TransferToSmartContract',
  UnsupportedToken = 'UnsupportedToken',
  InsufficientLiquidity = 'InsufficientLiquidity',
  ZeroPrice = 'ZeroPrice',

  RegularSwap = 'RegularSwap',
  RegularEthFlowSwap = 'EthFlowSwap',
  ExpertModeSwap = 'ExpertModeSwap',
  ExpertModeEthFlowSwap = 'ExpertModeEthFlowSwap',
  SwapWithWrappedToken = 'SwapWithWrappedToken',

  OfflineBrowser = 'OfflineBrowser',
  SwapDisabled = 'SwapDisabled',
  SwapError = 'SwapError',
}

export interface SwapButtonStateParams {
  account: string | undefined
  isSupportedWallet: boolean
  isReadonlyGnosisSafeUser: boolean
  isExpertMode: boolean
  isSwapUnsupported: boolean
  isTxBundlingEnabled: boolean
  wrapType: WrapType
  wrapInputError: string | undefined
  quoteError: QuoteError | undefined | null
  inputError?: string
  approvalState: ApprovalState
  feeWarningAccepted: boolean
  impactWarningAccepted: boolean
  isGettingNewQuote: boolean
  swapCallbackError: string | null
  trade: TradeGp | undefined | null
  isNativeIn: boolean
  isSmartContractWallet: boolean
  isBestQuoteLoading: boolean
  wrappedToken: Token
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
  const { wrapType, quoteError, approvalState } = input

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !input.inputError && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

  const isValid = !input.inputError && input.feeWarningAccepted && input.impactWarningAccepted
  const swapBlankState = !input.inputError && !input.trade

  if (quoteError && ![WrapType.WRAP, WrapType.UNWRAP].includes(wrapType)) {
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

  if (wrapType !== WrapType.NOT_APPLICABLE && input.wrapInputError) {
    return SwapButtonState.WrapError
  }

  if (wrapType === WrapType.WRAP) {
    return SwapButtonState.ShouldWrapNativeToken
  }

  if (wrapType === WrapType.UNWRAP) {
    return SwapButtonState.ShouldUnwrapNativeToken
  }

  if (swapBlankState || input.isGettingNewQuote || input.isBestQuoteLoading) {
    return SwapButtonState.Loading
  }

  if (input.isReadonlyGnosisSafeUser) {
    return SwapButtonState.ReadonlyGnosisSafeUser
  }

  if (!input.isNativeIn && showApproveFlow) {
    if (input.isTxBundlingEnabled) {
      // TODO: decide if this should be done re-using the current approval flow state or whether do it custom with bundling
      if (input.isExpertMode) {
        return SwapButtonState.ExpertApproveAndSwap
      }
      return SwapButtonState.ApproveAndSwap
    }
    return SwapButtonState.NeedApprove
  }

  if (input.inputError) {
    return SwapButtonState.SwapError
  }

  if (!isValid || !!input.swapCallbackError) {
    return SwapButtonState.SwapDisabled
  }

  if (input.isNativeIn) {
    if (getEthFlowEnabled(input.isSmartContractWallet)) {
      return input.isExpertMode ? SwapButtonState.ExpertModeEthFlowSwap : SwapButtonState.RegularEthFlowSwap
    } else {
      return SwapButtonState.SwapWithWrappedToken
    }
  }

  if (input.isExpertMode) {
    return SwapButtonState.ExpertModeSwap
  }

  return SwapButtonState.RegularSwap
}
