import { useCallback, useMemo, useEffect } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useCurrencyBalances } from 'state/connection/hooks'

import { useIsExpertMode } from 'state/user/hooks'
import { delay } from 'utils/misc'
import { useWeb3React } from '@web3-react/core'

import useRemainingNativeTxsAndCosts from '@src/custom/components/swap/EthFlow/containers/EthFlowModal/hooks/useRemainingNativeTxsAndCosts'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useWrapCallback } from 'hooks/useWrapCallback'
import { useDerivedSwapInfo, useDetectNativeToken, useSwapActionHandlers } from 'state/swap/hooks'
import { useSwapConfirmManager } from 'cow-react/modules/swap/hooks/useSwapConfirmManager'
import { Field } from 'state/swap/actions'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { HandleSwapCallback } from 'cow-react/modules/swap/hooks/useHandleSwap'
import { GpModal } from '@src/custom/components/Modal'
import { EthFlowModalContent, ModalTextContentProps } from '../../pure/EthFlowModalContent'
import {
  BottomContentParams,
  EthFlowSwapCallbackParams,
} from '../../pure/EthFlowModalContent/EthFlowModalBottomContent'
import { useEthFlowStatesAndSetters } from './hooks/useEthFlowStatesAndSetters'
import { getDerivedEthFlowState } from './utils/getDerivedEthFlowState'
import { EthFlowState } from '../..'

// used to avoid jarring UI effect from race between closing modal after successful operation(s)
// and the UI update showing confirmed actions
const MODAL_CLOSE_DELAY = 1000 // 1s

export interface EthFlowProps {
  nativeInput?: CurrencyAmount<Currency>
  wrapUnwrapAmount?: CurrencyAmount<Currency>
  // state
  approvalState: ApprovalState
  onDismiss: () => void
  approveCallback: (params?: { useModals: boolean }) => Promise<TransactionResponse | undefined>
  handleSwapCallback: HandleSwapCallback
  hasEnoughWrappedBalanceForSwap: boolean
}

export type PendingHashMap = { approveHash?: string; wrapHash?: string }

export function EthWethWrap({
  nativeInput,
  wrapUnwrapAmount,
  // state from hooks
  approvalState,
  onDismiss,
  approveCallback,
  handleSwapCallback,
  hasEnoughWrappedBalanceForSwap,
}: EthFlowProps) {
  const { account, chainId } = useWeb3React()
  const isExpertMode = useIsExpertMode()

  const {
    // track current pending operations
    pendingHashMap,
    setPendingHashMap,
    // general loading
    loading,
    setLoading,
    // APPROVE
    approvalDerivedState,
    approveSubmitted,
    approveError,
    setApproveSubmitted,
    setApproveError,
    // WRAPPING
    wrapDerivedState,
    wrapSubmitted,
    wrapError,
    setWrapSubmitted,
    setWrapError,
  } = useEthFlowStatesAndSetters({ chainId, approvalState })

  const { closeSwapConfirm } = useSwapConfirmManager()

  const { v2Trade: trade } = useDerivedSwapInfo()
  const { isNativeIn, isNativeOut, isWrappedIn, isWrappedOut, native, wrappedToken: wrapped } = useDetectNativeToken()
  const isNativeInSwap = isNativeIn && !isWrappedOut

  const needsApproval = approvalState === ApprovalState.NOT_APPROVED

  const operationSubmitted = approveSubmitted || wrapSubmitted

  // BALANCES
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  // wrap/unwrap/native/wrapped related constants
  const { isWrap, isUnwrap, isNative, wrappedSymbol, nativeSymbol } = useMemo(() => {
    const isWrap = isNativeIn && isWrappedOut
    return {
      isWrap,
      isUnwrap: isNativeOut && isWrappedIn,
      isNative: isNativeIn,
      wrappedSymbol: wrapped.symbol || 'wrapped native token',
      nativeSymbol: native.symbol || 'native token',
    }
  }, [isNativeIn, isNativeOut, isWrappedIn, isWrappedOut, native.symbol, wrapped.symbol])

  const isWrapOrUnwrap = isWrap || isUnwrap

  // user safety checks to make sure any on-chain native currency operations are economically safe
  // shows user warning with remaining available TXs if a certain threshold is reached
  const { balanceChecks } = useRemainingNativeTxsAndCosts({
    native,
    nativeBalance,
    nativeInput,
  })

  const needsWrapBeforeSwap = isNativeInSwap && !hasEnoughWrappedBalanceForSwap
  const needsWrap = needsWrapBeforeSwap || isWrapOrUnwrap

  // get derived EthFlow state
  const state = useMemo(
    () =>
      getDerivedEthFlowState({
        approveError,
        wrapError,
        approveState: approvalDerivedState,
        wrapState: wrapDerivedState,
        needsApproval,
        needsWrap,
        isExpertMode,
      }),
    [isExpertMode, approveError, needsApproval, needsWrap, wrapError, approvalDerivedState, wrapDerivedState]
  )
  // get modal text content: header and descriptions
  const modalTextContent = useMemo<ModalTextContentProps>(() => {
    return {
      approveSubmitted,
      isExpertMode,
      isNative,
      state,
      wrapSubmitted,
      wrappedSymbol,
      nativeSymbol,
    }
  }, [approveSubmitted, isExpertMode, isNative, nativeSymbol, state, wrapSubmitted, wrappedSymbol])
  // loading if either approving or wrap pending
  // and set loading local state accordingly..
  useEffect(() => {
    setLoading(state === EthFlowState.Loading)
  }, [setLoading, state])

  const wrapCallback = useWrapCallback(
    // is native token swap, use the wrapped equivalent as input currency
    wrapUnwrapAmount
  )

  const { onCurrencySelection } = useSwapActionHandlers()
  const { openSwapConfirmModal } = useSwapConfirmManager()

  const openSwapConfirm = useCallback(() => {
    if (!chainId || !trade) return

    onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCY[chainId])
    openSwapConfirmModal(trade)
  }, [chainId, trade, onCurrencySelection, openSwapConfirmModal])

  const handleError = useCallback(
    (error: any, type: 'WRAP' | 'APPROVE') => {
      console.error(error)

      if (type === 'WRAP') {
        setWrapError(error)
      } else if (type === 'APPROVE') {
        setApproveError(error)
      }

      setLoading(false)
      onDismiss()
    },
    [onDismiss, setApproveError, setLoading, setWrapError]
  )

  const handleWrap = useCallback(async () => {
    if (!wrapCallback) return
    setWrapError(null)
    setWrapSubmitted(false)

    try {
      const wrapTx = await wrapCallback()
      // save own local pending wrap hash to track progress
      setPendingHashMap((currTx) => ({
        ...currTx,
        wrapHash: wrapTx?.hash,
      }))
      setWrapSubmitted(true)
    } catch (error) {
      handleError(error, 'WRAP')
      setWrapSubmitted(false)
    }
  }, [handleError, setPendingHashMap, setWrapError, setWrapSubmitted, wrapCallback])

  const handleApprove = useCallback(async () => {
    if (!approveCallback) return
    setApproveError(null)
    setApproveSubmitted(false)

    try {
      const approveTx = await approveCallback()
      // save own local pending approve hash to track progress
      setPendingHashMap((currTx) => ({
        ...currTx,
        approveHash: approveTx?.hash,
      }))
      setApproveSubmitted(true)
    } catch (error) {
      handleError(error, 'APPROVE')
      setApproveSubmitted(false)
    }
  }, [approveCallback, handleError, setApproveError, setApproveSubmitted, setPendingHashMap])

  const handleSwap = useCallback(
    async ({ showConfirm, straightSwap }: EthFlowSwapCallbackParams) => {
      if (!chainId) return

      try {
        if (straightSwap) {
          onCurrencySelection(Field.INPUT, WRAPPED_NATIVE_CURRENCY[chainId])
          handleSwapCallback()
        } else {
          showConfirm ? openSwapConfirm() : closeSwapConfirm()
        }
      } catch (error) {
        throw error
      } finally {
        // close modal after swap initiated
        onDismiss()
      }
    },
    [chainId, openSwapConfirm, closeSwapConfirm, onCurrencySelection, onDismiss, handleSwapCallback]
  )

  const handleMountInExpertMode = useCallback(async () => {
    setWrapError(null)
    setApproveError(null)
    setLoading(true)
    setApproveSubmitted(false)
    setWrapSubmitted(false)

    try {
      if (needsApproval || needsWrap) {
        const [wrapTx, approveTx] = await Promise.all([
          needsWrap ? wrapCallback?.({ useModals: false }) : undefined,
          needsApproval ? approveCallback({ useModals: false }) : undefined,
        ])
        // save own local pending hashes to track progress
        setPendingHashMap((currTx) => ({
          ...currTx,
          wrapHash: wrapTx?.hash,
          approveHash: approveTx?.hash,
        }))
        // only set submitted states if we need to
        needsApproval && setApproveSubmitted(true)
        needsWrap && setWrapSubmitted(true)
      } else {
        // user doesn't need either, in expert mode we just start swap w/o forced wrapping
        handleSwap({ showConfirm: false, straightSwap: true, forceWrapNative: false })
      }
    } catch (error) {
      needsWrap && handleError(error, 'WRAP')
      needsApproval && handleError(error, 'APPROVE')
      setApproveSubmitted(false)
      setWrapSubmitted(false)
    }
  }, [
    needsApproval,
    wrapCallback,
    needsWrap,
    approveCallback,
    setWrapError,
    handleError,
    handleSwap,
    setApproveError,
    setLoading,
    setApproveSubmitted,
    setWrapSubmitted,
    setPendingHashMap,
  ])

  // expert mode only: swap/wrap/unwrap on mount
  useEffect(() => {
    if (isExpertMode) {
      handleMountInExpertMode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // pure wrap/unwrap - close modal after finish
  useEffect(() => {
    if (isWrapOrUnwrap && state === EthFlowState.SwapReady) {
      onDismiss()
    }
  }, [isWrapOrUnwrap, onDismiss, state])

  // expert mode only: auto close the wrapping modals and set swap page to WrappedNative <> ERC20
  useEffect(() => {
    if (isExpertMode && !isWrapOrUnwrap && operationSubmitted) {
      if (state === EthFlowState.SwapReady) {
        // reset the submission state
        setWrapSubmitted(false)
        setApproveSubmitted(false)
        // call the swap handle cb after 1s artificial delay
        // to not create jarring UI changes: confirmed tx update and modal closing
        delay(MODAL_CLOSE_DELAY).then(() => handleSwap({ showConfirm: true, straightSwap: false }))
      }
    }
  }, [isExpertMode, state, isWrapOrUnwrap, operationSubmitted, handleSwap, setApproveSubmitted, setWrapSubmitted])

  const bottomContentParams = useMemo<Omit<BottomContentParams, 'buttonText'>>(() => {
    return {
      actionButton: {
        approveError,
        handleApprove,
        handleMountInExpertMode,
        handleSwap,
        handleWrap,
        isExpertMode,
        loading,
        state,
        wrapError,
        approveState: approvalDerivedState,
        wrapState: wrapDerivedState,
      },
      pendingHashMap,
      wrappingPreview: {
        native,
        nativeBalance,
        wrapped,
        wrappedBalance,
        amount: nativeInput,
      },
    }
  }, [
    approveError,
    approvalDerivedState,
    isExpertMode,
    loading,
    native,
    nativeBalance,
    nativeInput,
    pendingHashMap,
    state,
    wrapError,
    wrapDerivedState,
    wrapped,
    wrappedBalance,
    // cbs
    handleApprove,
    handleMountInExpertMode,
    handleSwap,
    handleWrap,
  ])

  console.log('***** ETH FLOW MODAL RENDER')

  return (
    <EthFlowModalContent
      balanceChecks={balanceChecks}
      bottomContentParams={bottomContentParams}
      modalTextContent={modalTextContent}
      onDismiss={onDismiss}
    />
  )
}

export function EthFlowModal(props: EthFlowProps) {
  return (
    <GpModal isOpen onDismiss={props.onDismiss}>
      <EthWethWrap {...props} />
    </GpModal>
  )
}
