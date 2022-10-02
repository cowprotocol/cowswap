import { useState } from 'react'
import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { useGasPrices } from 'state/gas/hooks'
import { useSingleActivityState } from 'hooks/useActivityDerivedState'
import { ApprovalState } from 'hooks/useApproveCallback'
import { DerivedEthFlowStateProps } from './pure/EthFlowModalContent/EthFlowModalBottomContent'
import { EthFlowProps, PendingHashMap } from './containers/EthFlowModal'

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

// returns proper prop for visualiser: which currency is shown on left vs right (wrapped vs unwrapped)
export function _getCurrencyForVisualiser<T>(native: T, wrapped: T, isWrap: boolean, isUnwrap: boolean) {
  if (isWrap || isUnwrap) {
    return isWrap ? native : wrapped
  } else {
    return native
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
