import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { useGasPrices } from 'state/gas/hooks'
import { Props } from 'components/swap/EthFlow'
import { ActivityDerivedState } from 'components/AccountDetails/Transaction'

export const MINIMUM_TXS = '10'
export const AVG_APPROVE_COST_GWEI = '50000'
export const DEFAULT_GAS_FEE = parseUnits('50', 'gwei')

export const _setNativeLowBalanceError = (nativeSymbol: string) =>
  new Error(
    t`This ${nativeSymbol} wrapping operation may leave insufficient funds to cover any future on-chain transaction costs.`
  )

export function _isLowBalanceCheck({
  threshold,
  txCost,
  nativeInput,
  balance,
}: {
  threshold?: CurrencyAmount<Currency>
  txCost?: CurrencyAmount<Currency>
  nativeInput?: CurrencyAmount<Currency>
  balance?: CurrencyAmount<Currency>
}) {
  if (!threshold || !txCost) return false
  if (!nativeInput || !balance || nativeInput.add(txCost).greaterThan(balance)) return true
  // OK if: users_balance - (amt_input + 1_tx_cost) > low_balance_threshold
  return balance.subtract(nativeInput.add(txCost)).lessThan(threshold)
}

export const _getAvailableTransactions = ({
  nativeBalance,
  nativeInput,
  singleTxCost,
}: {
  nativeBalance?: CurrencyAmount<Currency>
  nativeInput?: CurrencyAmount<Currency>
  singleTxCost?: CurrencyAmount<Currency>
}) => {
  if (!nativeBalance || !nativeInput || !singleTxCost || nativeBalance.lessThan(nativeInput.add(singleTxCost))) {
    return null
  }

  // USER_BALANCE - (USER_WRAP_AMT + 1_TX_CST) / 1_TX_COST = AVAILABLE_TXS
  const txsAvailable = nativeBalance.subtract(nativeInput.add(singleTxCost)).divide(singleTxCost)
  return txsAvailable.lessThan('1') ? null : txsAvailable.quotient.toString()
}

export function _estimateTxCost(gasPrice: ReturnType<typeof useGasPrices>, native: Currency | undefined) {
  if (!native) {
    return {}
  }
  // TODO: should use DEFAULT_GAS_FEE from backup source
  // when/if implemented
  const gas = gasPrice?.standard || DEFAULT_GAS_FEE

  const amount = BigNumber.from(gas).mul(MINIMUM_TXS).mul(AVG_APPROVE_COST_GWEI)

  return {
    multiTxCost: CurrencyAmount.fromRawAmount(native, amount.toString()),
    singleTxCost: CurrencyAmount.fromFractionalAmount(native, amount.toString(), MINIMUM_TXS),
  }
}

export enum EthFlowState {
  SwapReady, // 0
  WrapAndApproveNeeded, // 1
  WrapAndApprovePending, // 2
  ApproveNeeded, // 3
  WrapNeeded, // 4
  ApprovePending, // 5
  ApproveFailed, // 6
  WrapFailed, // 7
  WrapPending, // 8
  WrapAndApproveFailed, // 9
  Loading, // 10
}

export type DerivedEthFlowStateProps = Pick<ModalTextContentProps, 'isExpertMode'> &
  Pick<Props, 'needsApproval' | 'needsWrap'> & {
    approveError: Error | null
    wrapError: Error | null
    approveState: ActivityDerivedState | null
    wrapState: ActivityDerivedState | null
  }

// returns derived ethflow state from current props
export function _getDerivedEthFlowState(params: DerivedEthFlowStateProps) {
  const { approveError, wrapError, approveState, wrapState, needsApproval, needsWrap, isExpertMode } = params
  // approve state
  const approveExpired = approveState?.isExpired
  const approvePending = approveState?.isPending
  const approveSentAndSuccessful = Boolean(!approveError && approveState?.isConfirmed)
  const approveNeeded = needsApproval && !approveSentAndSuccessful
  const approveFinished = !needsApproval || approveSentAndSuccessful
  // wrap state
  const wrapExpired = wrapState?.isExpired
  const wrapPending = wrapState?.isPending
  const wrapSentAndSuccessful = Boolean(!wrapError && wrapState?.isConfirmed)
  const wrapNeeded = needsWrap && !wrapSentAndSuccessful
  const wrapFinished = !needsWrap || wrapSentAndSuccessful

  // PENDING states
  if (wrapPending || approvePending) {
    // expertMode only - both operations pending
    if (isExpertMode && wrapPending && approvePending) {
      return EthFlowState.WrapAndApprovePending
    }
    // Only wrap is pending
    else if (wrapPending) {
      return EthFlowState.WrapPending
    }
    // Only approve is pending
    else return EthFlowState.ApprovePending
  }
  // FAILED states
  else if (approveExpired || wrapExpired) {
    // expertMode only - BOTH operations failed
    if (isExpertMode && approveExpired && wrapExpired) {
      return EthFlowState.WrapAndApproveFailed
    }
    // Only wrap failed
    else if (wrapExpired) {
      return EthFlowState.WrapFailed
    }
    // Only approve failed
    else return EthFlowState.ApproveFailed
  }
  // NEEDED state
  else if (approveNeeded || wrapNeeded) {
    // in expertMode and we need to wrap and swap
    if (isExpertMode && approveNeeded && wrapNeeded) {
      return EthFlowState.WrapAndApproveNeeded
    }
    // Only wrap needed
    else if (wrapNeeded) {
      // if (wrapPending) return EthFlowState.WrapPending
      return EthFlowState.WrapNeeded
    }
    // Only approve needed
    else {
      // if (approvePending) return EthFlowState.ApprovePending
      return EthFlowState.ApproveNeeded
    }
  }
  // BOTH successful, ready to swap
  else if (approveFinished && wrapFinished) {
    return EthFlowState.SwapReady
  }
  // LOADING
  else {
    return EthFlowState.Loading
  }
}

export type ModalTextContentProps = {
  wrappedSymbol: string
  nativeSymbol: string
  state: EthFlowState
  isExpertMode: boolean
  isNative: boolean
  wrapSubmitted: boolean
  approveSubmitted: boolean
}

// returns modal content: header and descriptions based on state
export function _getModalTextContent(params: ModalTextContentProps) {
  const { wrappedSymbol, nativeSymbol, state, isExpertMode, isNative /*, wrapSubmitted, approveSubmitted */ } = params
  // common text
  const swapHeader = `Swap ${wrappedSymbol}`
  const swapDescription = `Click "Swap" to submit an off-chain transaction and swap your ${wrappedSymbol}`
  const signatureRequiredDescription = 'Transaction signature required, please check your connected wallet'
  const transactionInProgress = 'Transaction in progress. See below for live status updates'
  // wrap
  const wrapHeader = isNative ? `Wrap your ${nativeSymbol}` : `Unwrap your ${wrappedSymbol}`
  const wrapInstructions = `Submit an on-chain ${isNative ? 'wrap' : 'unwrap'} transaction to convert your ${
    isNative ? nativeSymbol : wrappedSymbol
  } into ${isNative ? wrappedSymbol : nativeSymbol}`
  // approve
  const approveHeader = `Approve ${wrappedSymbol}`
  const approveInstructions = `Give CoW Protocol permission to swap your ${wrappedSymbol} via an on-chain ERC20 Approve transaction`
  // both
  const bothHeader = `Wrap and approve`
  const bothInstructions = `2 pending on-chain transactions: ${
    isNative ? `${nativeSymbol} wrap` : `${wrappedSymbol} unwrap`
  } and approve. Please check your connected wallet for both signature requests`

  let header = ''
  let description: string | null = null
  switch (state) {
    /**
     * FAILED operations
     * wrap/approve/both in expertMode failed
     */
    case EthFlowState.WrapAndApproveFailed: {
      header = 'Wrap and Approve failed!'
      description =
        'Both wrap and approve operations failed. Check that you are providing a sufficient gas limit for both transactions in your wallet. Click "Wrap and approve" to try again'
      break
    }
    case EthFlowState.WrapFailed: {
      header = `Wrap ${nativeSymbol} failed!`
      description = `Wrap operation failed. Check that you are providing a sufficient gas limit for the transaction in your wallet. Click "Wrap ${nativeSymbol}" to try again`
      break
    }
    case EthFlowState.ApproveFailed: {
      header = `Approve ${wrappedSymbol} failed!`
      description = `Approve operation failed. Check that you are providing a sufficient gas limit for the transaction in your wallet. Click "Approve ${wrappedSymbol}" to try again`
      break
    }

    /**
     * PENDING operations
     * wrap/approve/both in expertMode
     */
    case EthFlowState.WrapAndApprovePending: {
      header = bothHeader
      description = 'Transactions in progress. See below for live status updates of each operation'
      break
    }
    case EthFlowState.WrapPending:
    case EthFlowState.ApprovePending: {
      description = transactionInProgress
      // wrap only
      if (state === EthFlowState.WrapPending) {
        header = wrapHeader
      }
      // approve only
      else {
        header = approveHeader
      }
      break
    }

    /**
     * NEEDS operations
     * need to wrap/approve/both in expertMode
     */
    case EthFlowState.WrapAndApproveNeeded: {
      header = bothHeader
      description = bothInstructions
      break
    }
    case EthFlowState.WrapNeeded:
    case EthFlowState.ApproveNeeded: {
      // wrap only
      if (state === EthFlowState.WrapNeeded) {
        header = wrapHeader
        description = wrapInstructions
      }
      // approve only
      else {
        header = approveHeader
        description = approveInstructions
      }

      // in expert mode tx popups are automatic
      // so we show user message to check wallet popup
      if (isExpertMode) {
        description = signatureRequiredDescription
      }
      break
    }

    /**
     * SWAP operation ready
     */
    case EthFlowState.SwapReady: {
      header = swapHeader
      description = isExpertMode ? null : swapDescription
      break
    }

    // show generic operation loading as default
    // to shut TS up
    default: {
      header = 'Loading operation'
      description = 'Operation in progress!'
      break
    }
  }

  return { header, description }
}

// returns proper prop for visualiser: which currency is shown on left vs right (wrapped vs unwrapped)
export function _getCurrencyForVisualiser<T>(native: T, wrapped: T, isWrap: boolean, isUnwrap: boolean) {
  if (isWrap || isUnwrap) {
    return isWrap ? native : wrapped
  } else {
    return native
  }
}

export type ActionButtonParams = Pick<Props, 'isNativeIn'> &
  Pick<DerivedEthFlowStateProps, 'approveError' | 'wrapError' | 'approveState' | 'wrapState' | 'isExpertMode'> &
  Pick<ModalTextContentProps, 'nativeSymbol' | 'wrappedSymbol' | 'state'> & {
    isWrap: boolean
    loading: boolean
    handleSwap: (showSwapModal?: boolean) => Promise<void>
    handleApprove: () => Promise<void>
    handleWrap: () => Promise<void>
    handleMountInExpertMode: () => Promise<void>
  }
// conditionally renders the correct action button depending on the proposed action and current eth-flow state
export function _getActionButtonProps({
  approveError,
  wrapError,
  approveState,
  wrapState,
  isNativeIn,
  nativeSymbol,
  wrappedSymbol,
  isExpertMode,
  state,
  isWrap,
  loading,
  handleSwap,
  handleWrap,
  handleApprove,
  handleMountInExpertMode,
}: ActionButtonParams) {
  // async, pre-receipt errors (e.g user rejected TX)
  const hasErrored = !!(approveError || wrapError)

  let label = ''
  let showButton = !isExpertMode
  let showLoader = loading
  // dynamic props for cta button
  const buttonProps: {
    disabled: boolean
    onClick: (() => Promise<void>) | undefined
  } = {
    disabled: false,
    onClick: undefined,
  }

  switch (state) {
    // an operation has failed after submitting
    case EthFlowState.WrapAndApproveFailed:
      label = 'Wrap and approve'
      showButton = true
      buttonProps.onClick = handleMountInExpertMode
      break
    case EthFlowState.WrapFailed:
      label = `Wrap ${nativeSymbol}`
      showButton = true
      buttonProps.onClick = handleWrap
      break
    case EthFlowState.ApproveFailed:
      label = `Approve ${wrappedSymbol}`
      showButton = true
      buttonProps.onClick = handleApprove
      break
    // non failures
    case EthFlowState.WrapNeeded:
      label = isNativeIn || isWrap ? 'Wrap ' + nativeSymbol : 'Unwrap ' + wrappedSymbol
      buttonProps.onClick = handleWrap
      buttonProps.disabled = Boolean(wrapState?.isPending)
      break
    case EthFlowState.ApproveNeeded:
      label = 'Approve ' + wrappedSymbol
      buttonProps.onClick = handleApprove
      buttonProps.disabled = Boolean(approveState?.isPending)
      break
    case EthFlowState.SwapReady:
      label = 'Swap'
      buttonProps.onClick = () => handleSwap(true)
      buttonProps.disabled = loading || hasErrored
      break
    // loading = default
    default:
      buttonProps.disabled = true
      showLoader = true
      break
  }

  return {
    label,
    showButton,
    showLoader,
    buttonProps,
  }
}
