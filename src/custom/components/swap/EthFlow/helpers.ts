import { useState } from 'react'
import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { useGasPrices } from 'state/gas/hooks'
import { PendingHashMap, EthFlowProps } from 'components/swap/EthFlow'
import { ActivityDerivedState } from 'components/AccountDetails/Transaction'
import { useSingleActivityState } from 'hooks/useActivityDerivedState'
import { ApprovalState } from 'hooks/useApproveCallback'

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

export type EthFlowSwapCallbackParams = {
  showConfirm: boolean
  straightSwap?: boolean
  forceWrapNative?: boolean
}

export enum EthFlowState {
  SwapReady, // 0
  WrapAndApproveNeeded, // 1
  WrapAndApprovePending, // 2
  ApproveNeeded, // 3
  WrapNeeded, // 4
  ApprovePending, // 5
  ApproveInsufficient, // 6
  ApproveFailed, // 7
  WrapUnwrapFailed, // 8
  WrapUnwrapPending, // 9
  WrapAndApproveFailed, // 10
  Loading, // 11
}

export type DerivedEthFlowStateProps = Pick<ModalTextContentProps, 'isExpertMode'> & {
  approveError: Error | null
  wrapError: Error | null
  approveState: ActivityDerivedState | null
  wrapState: ActivityDerivedState | null
  needsApproval: boolean | undefined
  needsWrap: boolean | undefined
}

// returns derived ethflow state from current props
export function _getDerivedEthFlowState(params: DerivedEthFlowStateProps) {
  const { approveError, wrapError, approveState, wrapState, needsApproval, needsWrap, isExpertMode } = params
  // approve state
  const approveExpired = approveState?.isExpired
  const approvePending = approveState?.isPending
  const approveSentAndSuccessful = Boolean(!approveError && !approvePending && approveState?.isConfirmed)
  const approveInsufficient = approveSentAndSuccessful && needsApproval
  const approveFinished = !needsApproval || approveSentAndSuccessful
  // wrap state
  const wrapExpired = wrapState?.isExpired
  const wrapPending = wrapState?.isPending
  const wrapSentAndSuccessful = Boolean(!wrapError && !wrapPending && wrapState?.isConfirmed)
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
      return EthFlowState.WrapUnwrapPending
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
      return EthFlowState.WrapUnwrapFailed
    }
    // Only approve failed
    else return EthFlowState.ApproveFailed
  }
  // NEEDS wrap/approve state
  else if (needsApproval || wrapNeeded) {
    // INSUFFICIENT approve state
    if (approveInsufficient) {
      return EthFlowState.ApproveInsufficient
    }
    // in expertMode and we need to wrap and swap
    else if (isExpertMode && needsApproval && wrapNeeded) {
      return EthFlowState.WrapAndApproveNeeded
    }
    // Only wrap needed
    else if (wrapNeeded) {
      return EthFlowState.WrapNeeded
    }
    // Only approve needed
    else {
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

  // wrap
  const wrapUnwrapLabel = isNative ? 'Wrap' : 'Unwrap'
  const wrapHeader = `Swap with Wrapped ${nativeSymbol}`

  const ethFlowDescription = `The current version of CoW Swap can’t yet use native ${nativeSymbol} to execute a trade (Look out for that feature coming soon!).`

  const useYourWrappedBalance = `For now, use your existing ${wrappedSymbol} balance to continue this trade.`

  // approve
  const approveHeader = `Approve ${wrappedSymbol}`

  // both
  const bothHeader = `Wrap and approve`

  let header = ''
  let descriptions: string[] | null = null

  switch (state) {
    /**
     * FAILED operations
     * wrap/approve/both in expertMode failed
     */
    case EthFlowState.WrapAndApproveFailed: {
      header = 'Wrap and Approve failed!'
      descriptions = [
        'Both wrap and approve operations failed.',
        `Check that you are providing a sufficient gas limit for both transactions in your wallet. Click "Wrap and approve" to try again`,
      ]

      break
    }
    case EthFlowState.WrapUnwrapFailed: {
      const prefix = isNative ? `Wrap ${nativeSymbol}` : `Unwrap ${wrappedSymbol}`
      header = `${prefix} failed!`
      descriptions = [
        `${wrapUnwrapLabel} operation failed.`,
        `Check that you are providing a sufficient gas limit for the transaction in your wallet. Click "${prefix}" to try again`,
      ]
      break
    }
    case EthFlowState.ApproveFailed: {
      header = `Approve ${wrappedSymbol} failed!`
      descriptions = [
        `Approve operation failed. Check that you are providing a sufficient gas limit for the transaction in your wallet`,
        `Click "Approve ${wrappedSymbol}" to try again`,
      ]
      break
    }

    /**
     * PENDING operations
     * wrap/approve/both in expertMode
     */
    case EthFlowState.WrapAndApprovePending: {
      header = bothHeader
      descriptions = ['Transactions in progress', 'See below for live status updates of each operation']
      break
    }
    case EthFlowState.WrapUnwrapPending:
    case EthFlowState.ApprovePending: {
      descriptions = ['Transaction in progress. See below for live status updates']
      // wrap only
      if (state === EthFlowState.WrapUnwrapPending) {
        header = wrapHeader
      }
      // approve only
      else {
        header = approveHeader
      }
      break
    }

    case EthFlowState.ApproveInsufficient: {
      header = 'Approval amount insufficient!'
      descriptions = [
        'Approval amount insufficient for input amount',
        'Check that you are approving an amount equal to or greater than the input amount',
      ]

      break
    }

    /**
     * NEEDS operations
     * need to wrap/approve/both in expertMode
     */
    case EthFlowState.WrapAndApproveNeeded: {
      header = bothHeader
      descriptions = [
        `2 pending on-chain transactions: ${
          isNative ? `${nativeSymbol} wrap` : `${wrappedSymbol} unwrap`
        } and approve. Please check your connected wallet for both signature requests`,
      ]
      break
    }
    case EthFlowState.WrapNeeded:
    case EthFlowState.ApproveNeeded: {
      if (state === EthFlowState.WrapNeeded) {
        // wrap only
        header = wrapHeader
        descriptions = [ethFlowDescription, 'TODO: You dont have enough wrapped token...']
      } else {
        // approve only
        header = approveHeader
        descriptions = [
          ethFlowDescription,
          `Additionally, it's also required to do a one-time approval of ${wrappedSymbol} via an on-chain ERC20 Approve transaction.`,
        ]
      }

      // in expert mode tx popups are automatic
      // so we show user message to check wallet popup
      if (isExpertMode) {
        descriptions = ['Transaction signature required, please check your connected wallet']
      }
      break
    }

    /**
     * SWAP operation ready
     */
    case EthFlowState.SwapReady: {
      header = `No need to wrap ${nativeSymbol}`
      descriptions = isExpertMode
        ? null
        : [
            useYourWrappedBalance,
            `You have enough ${wrappedSymbol} for this trade, so you don't need to wrap any more ${nativeSymbol} to continue with this trade.`,
            `Press SWAP to use ${wrappedSymbol} and continue trading.`,
          ]
      break
    }

    // show generic operation loading as default
    // to shut TS up
    default: {
      header = 'Loading operation'
      descriptions = ['Operation in progress!']
      break
    }
  }

  return { header, descriptions }
}

// returns proper prop for visualiser: which currency is shown on left vs right (wrapped vs unwrapped)
export function _getCurrencyForVisualiser<T>(native: T, wrapped: T, isWrap: boolean, isUnwrap: boolean) {
  if (isWrap || isUnwrap) {
    return isWrap ? native : wrapped
  } else {
    return native
  }
}

export type ActionButtonParams = Pick<
  DerivedEthFlowStateProps,
  'approveError' | 'wrapError' | 'approveState' | 'wrapState' | 'isExpertMode'
> &
  Pick<ModalTextContentProps, 'nativeSymbol' | 'wrappedSymbol' | 'state'> & {
    isWrap: boolean
    isNativeIn: boolean
    loading: boolean
    handleSwap: ({ showConfirm, straightSwap }: EthFlowSwapCallbackParams) => Promise<void>
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
      // disable button on load (after clicking)
      buttonProps.disabled = showLoader
      break
    case EthFlowState.WrapUnwrapFailed:
      label = isNativeIn ? `Wrap ${nativeSymbol}` : `Unwrap ${wrappedSymbol}`
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
    case EthFlowState.ApproveInsufficient:
      label = 'Approve ' + wrappedSymbol
      // Show button if approve insufficient (applies to expertMode)
      if (state === EthFlowState.ApproveInsufficient) {
        showButton = true
      }
      buttonProps.onClick = handleApprove
      buttonProps.disabled = Boolean(approveState?.isPending)
      break
    case EthFlowState.SwapReady:
      label = 'Swap'
      buttonProps.onClick = () => handleSwap({ showConfirm: true })
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

/**
 * useEthFlowStatesAndSetters
 *
 * @returns all ETH-FLOW states and setters related to wrap/approve
 */
export function useEthFlowStatesAndSetters({
  chainId,
  approvalState,
}: Pick<EthFlowProps, 'approvalState'> & {
  chainId?: number
}) {
  const [pendingHashMap, setPendingHashMap] = useState<PendingHashMap>({
    approveHash: undefined,
    wrapHash: undefined,
  })
  // maintain own local state of approve/wrap states
  const [loading, setLoading] = useState(false)
  // APPROVE STATE - use activity state and derive isPending based on both the hook and activity state
  const approvalActivityState = useSingleActivityState({ chainId, id: pendingHashMap.approveHash || '' })
  const approvalDerivedState = !!approvalActivityState
    ? {
        ...approvalActivityState,
        isPending: approvalActivityState?.isPending || approvalState === ApprovalState.PENDING,
      }
    : null
  const [approveSubmitted, setApproveSubmitted] = useState(false)
  const [approveError, setApproveError] = useState<Error | null>(null)
  // WRAP STATE
  const wrapActivityState = useSingleActivityState({ chainId, id: pendingHashMap.wrapHash || '' })
  const [wrapSubmitted, setWrapSubmitted] = useState(false)
  const [wrapError, setWrapError] = useState<Error | null>(null)

  return {
    pendingHashMap,
    setPendingHashMap,
    loading,
    setLoading,
    // APPROVE
    approvalDerivedState,
    approveSubmitted,
    setApproveSubmitted,
    approveError,
    setApproveError,
    // WRAPPING
    wrapDerivedState: wrapActivityState,
    wrapSubmitted,
    setWrapSubmitted,
    wrapError,
    setWrapError,
  }
}
