import { useState, useCallback, useMemo, useEffect } from 'react'
import styled from 'styled-components/macro'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk-core'

import { ButtonPrimary } from 'components/Button'
import WrappingVisualisation from './WrappingVisualisation'

import { useCurrencyBalances } from 'state/connection/hooks'
import { useIsTransactionPending } from 'state/enhancedTransactions/hooks'

import { useGasPrices } from 'state/gas/hooks'
import { _isLowBalanceCheck, _getAvailableTransactions, _estimateTxCost } from './helpers'
import { Trans } from '@lingui/macro'
import SimpleAccountDetails from '../../AccountDetails/SimpleAccountDetails'
import Loader from 'components/Loader'
import { CloseIcon, ThemedText } from 'theme'
import { RowBetween } from 'components/Row'
import { useIsExpertMode } from 'state/user/hooks'
import { delay } from 'utils/misc'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  justify-content: center;
  width: 100%;
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  font-size: smaller;
  overflow: hidden;

  margin: 0 auto;
  padding: 24px 24px;
  background: ${({ theme }) => theme.bg4};

  > h2 {
    color: ${({ theme }) => theme.wallet.color};
  }

  > ${ButtonPrimary} {
    background: #62d9ff;
    width: 100%;
    padding: 6px;
    margin: 6px auto 0;

    &:disabled {
      background-color: ${({ theme }) => theme.disabled};
    }
  }
`

const ModalMessage = styled.p`
  display: flex;
  flex-flow: row wrap;
  padding: 0;
  width: 100%;
  color: ${({ theme }) => theme.wallet.color};
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
`

// used to avoid jarring UI effect from race between closing modal after successful operation(s)
// and the UI update showing confirmed actions
const MODAL_CLOSE_DELAY = 1000 // 1s

export interface Props {
  account?: string
  native: Currency
  wrapped: Token & { logoURI: string }
  nativeInput?: CurrencyAmount<Currency>
  isNativeIn: boolean
  isNativeOut: boolean
  isWrappedIn: boolean
  isWrappedOut: boolean

  // state
  needsApproval: boolean
  needsWrap: boolean

  // cbs
  onDismiss: () => void
  approveCallback: (params?: { useModals: boolean }) => Promise<TransactionResponse | undefined>
  wrapCallback: ((params?: { useModals: boolean }) => Promise<TransactionResponse | undefined>) | undefined
  swapCallback: (showConfirmModal?: boolean) => void
}

enum EthFlowState {
  SwapReady,
  WrapAndApproveNeeded,
  ApproveNeeded,
  WrapNeeded,
  Loading,
}

export default function EthWethWrap({
  account,
  native,
  wrapped,
  nativeInput,
  isNativeIn,
  isNativeOut,
  isWrappedIn,
  isWrappedOut,

  // state
  needsApproval,
  needsWrap,

  // cbs
  onDismiss,
  approveCallback,
  wrapCallback,
  swapCallback,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [wrapError, setWrapError] = useState<Error | null>(null)
  const [approveError, setApproveError] = useState<Error | null>(null)
  const [pendingHashMap, setPendingHashMap] = useState<{ approveHash?: string; wrapHash?: string }>({
    approveHash: undefined,
    wrapHash: undefined,
  })

  const isExpertMode = useIsExpertMode()

  // maintain own local state of approve/wrap states
  const [approveSubmitted, setApproveSubmitted] = useState(false)
  const [wrapSubmitted, setWrapSubmitted] = useState(false)
  const isApprovePending = useIsTransactionPending(pendingHashMap.approveHash)
  const isWrapPending = useIsTransactionPending(pendingHashMap.wrapHash)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  // wrap/unwrap/native/wrapped related constants
  const { isWrap, isUnwrap, isNative, wrappedSymbol, nativeSymbol } = useMemo(() => {
    const isWrap = !isNativeIn && isWrappedOut
    return {
      isWrap,
      isUnwrap: !isNativeOut && isWrappedIn,
      isNative: isNativeIn || isWrap,
      wrappedSymbol: wrapped.symbol || 'wrapped native token',
      nativeSymbol: native.symbol || 'native token',
    }
  }, [isNativeIn, isNativeOut, isWrappedIn, isWrappedOut, native.symbol, wrapped.symbol])

  // user safety checks to make sure any on-chain native currency operations are economically safe
  // shows user warning with remaining available TXs if a certain threshold is reached
  const { balanceChecks } = useRemainingTxsAndCosts({
    native,
    isNativeIn,
    nativeBalance,
    nativeInput,
  })

  // get derived EthFlow state
  const state = useMemo(
    () =>
      _getDerivedEthFlowState({
        approveError,
        wrapError,
        approveSubmitted,
        wrapSubmitted,
        isApprovePending,
        isWrapPending,
        needsApproval,
        needsWrap,
        isExpertMode,
      }),
    [
      isExpertMode,
      approveError,
      approveSubmitted,
      isApprovePending,
      isWrapPending,
      needsApproval,
      needsWrap,
      wrapError,
      wrapSubmitted,
    ]
  )

  // loading if either approving or wrap pending
  // and set loading local state accordingly..
  useEffect(() => {
    setLoading(isApprovePending || isWrapPending)
  }, [isApprovePending, isWrapPending])

  const handleError = useCallback(
    (error: any, type: 'WRAP' | 'APPROVE') => {
      console.error(error)

      if (type === 'WRAP') {
        setWrapError(error)
      }
      if (type === 'APPROVE') {
        setApproveError(error)
      }

      setLoading(false)
      onDismiss()
    },
    [onDismiss]
  )

  const handleWrap = useCallback(async () => {
    if (!wrapCallback) return
    setWrapError(null)
    setLoading(true)
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
    } finally {
      // is pure wrap/unwrap operation, close modal
      if (isWrap || isUnwrap) {
        onDismiss()
      }
    }
  }, [handleError, isUnwrap, isWrap, onDismiss, wrapCallback])

  const handleApprove = useCallback(async () => {
    if (!approveCallback) return
    setApproveError(null)
    setLoading(true)
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
  }, [approveCallback, handleError])

  const handleSwap = useCallback(
    async (showSwapModal?: boolean) => {
      try {
        swapCallback(!!showSwapModal)
      } catch (error) {
        throw error
      } finally {
        // close modal after swap initiated
        onDismiss()
      }
    },
    [swapCallback, onDismiss]
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
        // user doesn't need either, in expert mode we just start swap
        // and pass true to show swap confirmation modal
        handleSwap(true)
      }
    } catch (error) {
      needsWrap && handleError(error, 'WRAP')
      needsApproval && handleError(error, 'APPROVE')
      setApproveSubmitted(false)
      setWrapSubmitted(false)
    } finally {
      if (!isNativeIn) {
        onDismiss()
      }
    }
  }, [needsApproval, needsWrap, wrapCallback, approveCallback, handleError, handleSwap, isNativeIn, onDismiss])

  // get modal text content: header and descriptions
  const { header, description } = useMemo(
    () =>
      _getModalTextContent({
        wrappedSymbol,
        nativeSymbol,
        state,
        isExpertMode,
        isNative,
        wrapSubmitted,
        approveSubmitted,
      }),
    [approveSubmitted, isExpertMode, isNative, nativeSymbol, state, wrapSubmitted, wrappedSymbol]
  )

  // expert mode only: swap/wrap/unwrap on mount
  useEffect(() => {
    if (isExpertMode) {
      handleMountInExpertMode()
    } else if (isWrap || isUnwrap) {
      // is a pure wrap/unwrap, just start the tx
      handleWrap()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // expert mode only: auto close the wrapping modals and set swap page to WrappedNative <> ERC20
  useEffect(() => {
    if (isExpertMode && (wrapSubmitted || approveSubmitted)) {
      if (state === EthFlowState.SwapReady) {
        // reset the submission state
        setWrapSubmitted(false)
        setApproveSubmitted(false)
        // call the swap handle cb after 1s artificial delay
        // to not create jarring UI changes: confirmed tx update and modal closing
        delay(MODAL_CLOSE_DELAY).then(() => handleSwap(true))
      }
    }
  }, [approveSubmitted, handleSwap, isExpertMode, state, wrapSubmitted])

  // conditionally renders the correct action button depending on the proposed action and current eth-flow state
  const renderActionButton = useCallback(
    () =>
      _buildActionButton({
        approveError,
        wrapError,
        isApprovePending,
        isWrapPending,
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
      }),
    [
      // errors
      approveError,
      wrapError,
      // state
      state,
      loading,
      isApprovePending,
      isWrapPending,
      // misc
      isExpertMode,
      isNativeIn,
      isWrap,
      nativeSymbol,
      wrappedSymbol,
      // cbs
      handleSwap,
      handleWrap,
      handleApprove,
    ]
  )

  return (
    <Wrapper>
      <RowBetween marginBottom={20}>
        <ThemedText.MediumHeader>
          <Trans>{header}</Trans>
        </ThemedText.MediumHeader>
        <CloseIcon onClick={onDismiss} />
      </RowBetween>

      {description && (
        <ModalMessage>
          <span>
            <Trans>{description}</Trans>
          </span>
        </ModalMessage>
      )}
      {balanceChecks?.isLowBalance && (
        <ModalMessage>
          <span>
            <Trans>
              At current gas prices, your remaining {nativeSymbol} balance after confirmation may be{' '}
              {!balanceChecks.txsRemaining ? (
                <strong>insufficient for any further on-chain transactions.</strong>
              ) : (
                <>
                  sufficient for{' '}
                  <strong>up to {balanceChecks.txsRemaining} wrapping, unwrapping, or approval operation(s)</strong>.
                </>
              )}
            </Trans>
          </span>
        </ModalMessage>
      )}
      <WrappingVisualisation
        nativeSymbol={_getCurrencyForVisualiser(nativeSymbol, wrappedSymbol, isWrap, isUnwrap)}
        nativeBalance={_getCurrencyForVisualiser(nativeBalance, wrappedBalance, isWrap, isUnwrap)}
        native={_getCurrencyForVisualiser(native, wrapped, isWrap, isUnwrap)}
        wrapped={_getCurrencyForVisualiser(wrapped, native, isWrap, isUnwrap)}
        wrappedBalance={_getCurrencyForVisualiser(wrappedBalance, nativeBalance, isWrap, isUnwrap)}
        wrappedSymbol={_getCurrencyForVisualiser(wrappedSymbol, nativeSymbol, isWrap, isUnwrap)}
        nativeInput={nativeInput}
      />
      <SimpleAccountDetails
        pendingTransactions={Object.values(pendingHashMap)}
        confirmedTransactions={[]}
        $margin="12px 0 0"
      />
      {renderActionButton()}
    </Wrapper>
  )
}

type DerivedEthFlowStateProps = Pick<ModalTextContentProps, 'wrapSubmitted' | 'approveSubmitted' | 'isExpertMode'> &
  Pick<Props, 'needsApproval' | 'needsWrap'> & {
    approveError: Error | null
    wrapError: Error | null
    approveSubmitted: boolean
    wrapSubmitted: boolean
    isApprovePending: boolean
    isWrapPending: boolean
  }

// returns derived ethflow state from current props
function _getDerivedEthFlowState(params: DerivedEthFlowStateProps) {
  const {
    approveError,
    wrapError,
    approveSubmitted,
    wrapSubmitted,
    isApprovePending,
    isWrapPending,
    needsApproval,
    needsWrap,
    isExpertMode,
  } = params
  // approve state
  const approveSentAndSuccessful = !approveError && approveSubmitted && !isApprovePending
  const approveFinished = !needsApproval || approveSentAndSuccessful
  // wrap state
  const wrapSentAndSuccessful = !wrapError && wrapSubmitted && !isWrapPending
  const wrapFinished = !needsWrap || wrapSentAndSuccessful

  let state = EthFlowState.Loading
  if (approveFinished && wrapFinished) {
    state = EthFlowState.SwapReady
  } else if (isExpertMode && needsWrap && !wrapSentAndSuccessful && needsApproval && !approveSentAndSuccessful) {
    state = EthFlowState.WrapAndApproveNeeded
  } else if (needsWrap && !wrapSentAndSuccessful) {
    state = EthFlowState.WrapNeeded
  } else if (needsApproval && !approveSentAndSuccessful) {
    state = EthFlowState.ApproveNeeded
  } else {
    state = EthFlowState.Loading
  }

  return state
}

type ModalTextContentProps = {
  wrappedSymbol: string
  nativeSymbol: string
  state: EthFlowState
  isExpertMode: boolean
  isNative: boolean
  wrapSubmitted: boolean
  approveSubmitted: boolean
}

// returns modal content: header and descriptions based on state
function _getModalTextContent(params: ModalTextContentProps) {
  const { wrappedSymbol, nativeSymbol, state, isExpertMode, isNative, wrapSubmitted, approveSubmitted } = params
  // common text
  const swapHeader = `Swap ${wrappedSymbol}`
  const swapDescription = `Click "Swap" to submit an off-chain transaction and swap your ${wrappedSymbol}`
  const wrapHeader = isNative ? `Wrap your ${nativeSymbol}` : `Unwrap your ${wrappedSymbol}`

  let header = '',
    description: string | null = null
  // in expert mode we start the logic right away
  // and sometimes there can be 2 simultaneous transactions
  if (isExpertMode) {
    if (state === EthFlowState.WrapAndApproveNeeded) {
      header = `${isNative ? 'Wrap ' + nativeSymbol : 'Unwrap ' + wrappedSymbol} and Approve`
      description = `2 pending on-chain transactions: ${
        isNative ? nativeSymbol + ' wrap' : wrappedSymbol + ' unwrap'
      } and approve. Please check your connected wallet for both signature requests`
      // Hide description on submission, pending tx visual is enough
      if (wrapSubmitted && approveSubmitted) {
        description = null
      }
    } else if (state === EthFlowState.WrapNeeded) {
      header = wrapHeader
      if (!wrapSubmitted) {
        description = `Transaction signature required, please check your connected wallet`
      } else {
        // Hide description on submission, pending tx visual is enough
        description = null
      }
    } else if (state === EthFlowState.ApproveNeeded) {
      header = `Approving ${wrappedSymbol}`
      description = `${wrappedSymbol} approval transaction in progress`
      if (!approveSubmitted) {
        description = 'Transaction signature required, please check your connected wallet'
      } else {
        // Hide description on submission, pending tx visual is enough
        description = null
      }
    } else {
      header = swapHeader
      description = null
    }
  } else {
    // pending wrap operation
    if (state === EthFlowState.WrapNeeded) {
      header = wrapHeader
      description = `Submit an on-chain ${isNative ? 'wrap' : 'unwrap'} transaction to convert your ${
        isNative ? nativeSymbol : wrappedSymbol
      } into ${isNative ? wrappedSymbol : nativeSymbol}`
      // pending approve operation
    } else if (state === EthFlowState.ApproveNeeded) {
      header = `Approve ${wrappedSymbol}`
      description = `Give CoW Protocol permission to swap your ${wrappedSymbol} via an on-chain ERC20 Approve transaction`
    } else {
      // swap operation
      header = swapHeader
      description = swapDescription
    }
  }
  return { header, description }
}

// returns proper prop for visualiser: which currency is shown on left vs right (wrapped vs unwrapped)
function _getCurrencyForVisualiser<T>(native: T, wrapped: T, isWrap: boolean, isUnwrap: boolean) {
  if (isWrap || isUnwrap) {
    return isWrap ? native : wrapped
  } else {
    return native
  }
}

// conditionally renders the correct action button depending on the proposed action and current eth-flow state
function _buildActionButton({
  approveError,
  wrapError,
  isApprovePending,
  isWrapPending,
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
}: Pick<Props, 'isNativeIn'> &
  Pick<DerivedEthFlowStateProps, 'approveError' | 'wrapError' | 'isApprovePending' | 'isWrapPending' | 'isExpertMode'> &
  Pick<ModalTextContentProps, 'nativeSymbol' | 'wrappedSymbol' | 'state'> & {
    isWrap: boolean
    loading: boolean
    handleSwap: (showSwapModal?: boolean) => Promise<void>
    handleApprove: () => Promise<void>
    handleWrap: () => Promise<void>
  }) {
  const hasErrored = !!(approveError || wrapError)
  let actionButton
  if (isExpertMode || state === EthFlowState.SwapReady) {
    actionButton = isExpertMode ? null : (
      <ButtonPrimary disabled={loading || hasErrored} padding="0.5rem" maxWidth="70%" onClick={() => handleSwap(true)}>
        {loading ? <Loader /> : <Trans>Swap</Trans>}
      </ButtonPrimary>
    )
  } else {
    if (state === EthFlowState.WrapNeeded) {
      // show wrap button
      actionButton = (
        <ButtonPrimary disabled={isWrapPending || hasErrored} padding="0.5rem" maxWidth="70%" onClick={handleWrap}>
          {isWrapPending ? (
            <Loader />
          ) : (
            <Trans>{isNativeIn || isWrap ? 'Wrap ' + nativeSymbol : 'Unwrap ' + wrappedSymbol}</Trans>
          )}
        </ButtonPrimary>
      )
    } else if (state === EthFlowState.ApproveNeeded) {
      // show approval button
      actionButton = (
        <ButtonPrimary
          disabled={isApprovePending || hasErrored}
          padding="0.5rem"
          maxWidth="70%"
          onClick={handleApprove}
        >
          {isApprovePending ? <Loader /> : <Trans>Approve {wrappedSymbol}</Trans>}
        </ButtonPrimary>
      )
    } else {
      actionButton = (
        <ButtonPrimary disabled padding="0.5rem" maxWidth="70%">
          <Loader />
        </ButtonPrimary>
      )
    }
  }

  return <ButtonWrapper>{actionButton}</ButtonWrapper>
}

type RemainingTxAndCostsParams = Pick<Props, 'isNativeIn' | 'nativeInput' | 'native'> & {
  nativeBalance: CurrencyAmount<Currency> | undefined
}

function useRemainingTxsAndCosts({ native, isNativeIn, nativeBalance, nativeInput }: RemainingTxAndCostsParams) {
  const { chainId } = useActiveWeb3React()
  const gasPrice = useGasPrices(chainId)
  // returns the cost of 1 tx and multi txs
  const txCosts = useMemo(() => _estimateTxCost(gasPrice, native), [gasPrice, native])
  // does the user have a lower than set threshold balance? show error
  const balanceChecks: { isLowBalance: boolean; txsRemaining: string | null } | undefined = useMemo(() => {
    if (!isNativeIn) return undefined

    const { multiTxCost, singleTxCost } = txCosts

    return {
      isLowBalance: _isLowBalanceCheck({
        threshold: multiTxCost,
        nativeInput,
        balance: nativeBalance,
        txCost: singleTxCost,
      }),
      txsRemaining: _getAvailableTransactions({ nativeBalance, nativeInput, singleTxCost }),
    }
  }, [isNativeIn, txCosts, nativeBalance, nativeInput])

  return { balanceChecks, ...txCosts }
}
