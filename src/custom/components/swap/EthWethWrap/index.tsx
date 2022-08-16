import { useState, useCallback, useMemo, useEffect } from 'react'
import styled from 'styled-components/macro'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk-core'

import { ButtonPrimary } from 'components/Button'
import WrappingVisualisation from './WrappingVisualisation'

import { useCurrencyBalances } from 'state/connection/hooks'
import { useIsTransactionPending } from 'state/enhancedTransactions/hooks'

import { useGasPrices } from 'state/gas/hooks'
import { useWeb3React } from '@web3-react/core'
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
  const [error, setError] = useState<Error | null>(null)
  const [pendingHashMap, setPendingHashMap] = useState<{ approveHash?: string; wrapHash?: string }>({
    approveHash: undefined,
    wrapHash: undefined,
  })

  const { chainId } = useWeb3React()
  const isExpertMode = useIsExpertMode()
  const gasPrice = useGasPrices(chainId)

  // returns the cost of 1 tx and multi txs
  const { multiTxCost, singleTxCost } = useMemo(() => _estimateTxCost(gasPrice, native), [gasPrice, native])

  const [approveSubmitted, setApproveSubmitted] = useState(false)
  const [wrapSubmitted, setWrapSubmitted] = useState(false)
  const isApprovePending = useIsTransactionPending(pendingHashMap.approveHash)
  const isWrapPending = useIsTransactionPending(pendingHashMap.wrapHash)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  // does the user have a lower than set threshold balance? show error
  const balanceChecks: { isLowBalance: boolean; txsRemaining: string | null } | undefined = useMemo(() => {
    if (!isNativeIn) return undefined

    return {
      isLowBalance: _isLowBalanceCheck({
        threshold: multiTxCost,
        nativeInput,
        balance: nativeBalance,
        txCost: singleTxCost,
      }),
      txsRemaining: _getAvailableTransactions({ nativeBalance, nativeInput, singleTxCost }),
    }
  }, [isNativeIn, multiTxCost, nativeBalance, nativeInput, singleTxCost])

  // states and constants
  const {
    wrapFinished,
    approveFinished,
    wrapSentAndSuccessful,
    approveSentAndSuccessful,
    isNative,
    isWrap,
    isUnwrap,
    wrappedSymbol,
    nativeSymbol,
  } = useMemo(() => {
    const wrapSentAndSuccessful = wrapSubmitted && !isWrapPending
    const approveSentAndSuccessful = approveSubmitted && !isApprovePending
    const isWrap = !isNativeIn && isWrappedOut
    const isNative = isNativeIn || isWrap

    return {
      wrapFinished: !needsWrap || (wrapSubmitted && wrapSentAndSuccessful),
      approveFinished: !needsApproval || (approveSubmitted && approveSentAndSuccessful),
      wrapSentAndSuccessful,
      approveSentAndSuccessful,
      isWrap,
      isUnwrap: !isNativeOut && isWrappedIn,
      isNative,
      wrappedSymbol: wrapped.symbol || 'wrapped native token',
      nativeSymbol: native.symbol || 'native token',
    }
  }, [
    approveSubmitted,
    isApprovePending,
    isNativeIn,
    isNativeOut,
    isWrapPending,
    isWrappedIn,
    isWrappedOut,
    native.symbol,
    needsApproval,
    needsWrap,
    wrapSubmitted,
    wrapped.symbol,
  ])

  // Listen for changes in isWrapPending
  // and set loading local state accordingly..
  useEffect(() => {
    setLoading(isApprovePending || isWrapPending)
  }, [isApprovePending, isWrapPending])

  const handleError = useCallback(
    (error: any) => {
      console.error(error)

      setError(error)
      setLoading(false)
      onDismiss()
    },
    [onDismiss]
  )

  const handleWrap = useCallback(async () => {
    if (!wrapCallback) return
    setError(null)
    setLoading(true)
    setWrapSubmitted(false)

    try {
      const wrapTx = await wrapCallback()
      setPendingHashMap((currTx) => ({
        ...currTx,
        wrapHash: wrapTx?.hash,
      }))
      setWrapSubmitted(true)
    } catch (error) {
      handleError(error)
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
    setError(null)
    setLoading(true)
    setApproveSubmitted(false)

    try {
      const approveTx = await approveCallback()
      setPendingHashMap((currTx) => ({
        ...currTx,
        approveHash: approveTx?.hash,
      }))
      setApproveSubmitted(true)
    } catch (error) {
      handleError(error)
      setApproveSubmitted(false)
    }
  }, [approveCallback, handleError])

  const handleSwap = useCallback(
    async (showSwapModal?: boolean) => {
      setError(null)

      try {
        await swapCallback(!!showSwapModal)
      } catch (error) {
        handleError(error)
      } finally {
        // close modal after swap initiated
        onDismiss()
      }
    },
    [swapCallback, handleError, onDismiss]
  )

  const handleMountInExpertMode = useCallback(async () => {
    setError(null)
    setLoading(true)
    setApproveSubmitted(false)
    setWrapSubmitted(false)

    try {
      if (needsApproval || needsWrap) {
        const [wrapTx, approveTx] = await Promise.all([
          needsWrap ? wrapCallback?.({ useModals: false }) : undefined,
          needsApproval ? approveCallback({ useModals: false }) : undefined,
        ])
        setPendingHashMap((currTx) => ({
          ...currTx,
          wrapHash: wrapTx?.hash,
          approveHash: approveTx?.hash,
        }))
        needsApproval && setApproveSubmitted(true)
        needsWrap && setWrapSubmitted(true)
      } else {
        // user doesn't need either, in expert mode we just start swap
        // and pass true to show swap confirmation modal
        handleSwap(true)
      }
    } catch (error) {
      handleError(error)
      setApproveSubmitted(false)
      setWrapSubmitted(false)
    } finally {
      if (!isNativeIn) {
        onDismiss()
      }
    }
  }, [needsApproval, needsWrap, wrapCallback, approveCallback, handleError, handleSwap, isNativeIn, onDismiss])

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
      if (approveFinished && wrapFinished) {
        // reset the submission state
        setWrapSubmitted(false)
        setApproveSubmitted(false)
        // call the swap handle cb after 1s artificial delay
        // to not create jarring UI changes: confirmed tx update and modal closing
        delay(MODAL_CLOSE_DELAY).then(() => handleSwap(true))
      }
    }
  }, [isExpertMode, approveFinished, approveSubmitted, handleSwap, wrapFinished, wrapSubmitted])

  const renderActionButton = useCallback(() => {
    let actionButton
    if (isExpertMode || (approveFinished && wrapFinished)) {
      actionButton = isExpertMode ? null : (
        <ButtonPrimary disabled={loading || !!error} padding="0.5rem" maxWidth="70%" onClick={() => handleSwap(true)}>
          {loading ? <Loader /> : <Trans>Swap</Trans>}
        </ButtonPrimary>
      )
    } else {
      if (needsWrap && !wrapSentAndSuccessful) {
        // show wrap button
        actionButton = (
          <ButtonPrimary disabled={loading || !!error} padding="0.5rem" maxWidth="70%" onClick={handleWrap}>
            {loading ? (
              <Loader />
            ) : (
              <Trans>{isNativeIn || isWrap ? 'Wrap ' + nativeSymbol : 'Unwrap ' + wrappedSymbol}</Trans>
            )}
          </ButtonPrimary>
        )
      } else if (needsApproval && !approveSubmitted) {
        // show approval button
        actionButton = (
          <ButtonPrimary disabled={isApprovePending || !!error} padding="0.5rem" maxWidth="70%" onClick={handleApprove}>
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
  }, [
    approveFinished,
    approveSubmitted,
    error,
    handleApprove,
    handleSwap,
    handleWrap,
    isApprovePending,
    isExpertMode,
    isNativeIn,
    isWrap,
    loading,
    nativeSymbol,
    needsApproval,
    needsWrap,
    wrapFinished,
    wrapSentAndSuccessful,
    wrappedSymbol,
  ])

  const { header, description } = useMemo(() => {
    // common text
    const swapHeader = `Swap ${wrappedSymbol}`
    const swapDescription = `Click "Swap" to submit an off-chain transaction and swap your ${wrappedSymbol}`
    const wrapHeader = isNative ? `Wrap your ${nativeSymbol}` : `Unwrap your ${wrappedSymbol}`

    let header = '',
      description: string | null = null
    // in expert mode we start the logic right away
    // and sometimes there can be 2 simultaneous transactions
    if (isExpertMode) {
      if (needsWrap && !wrapSentAndSuccessful && needsApproval && !approveSentAndSuccessful) {
        header = `${isNative ? 'Wrap ' + nativeSymbol : 'Unwrap ' + wrappedSymbol} and Approve`
        description = `2 pending on-chain transactions: ${
          isNative ? nativeSymbol + ' wrap' : wrappedSymbol + ' unwrap'
        } and approve. Please check your connected wallet for both signature requests`
        // Hide description on submission, pending tx visual is enough
        if (wrapSubmitted && approveSubmitted) {
          description = null
        }
      } else if (needsWrap && !wrapSentAndSuccessful) {
        header = wrapHeader
        if (!wrapSubmitted) {
          description = `Transaction signature required, please check your connected wallet`
        } else {
          // Hide description on submission, pending tx visual is enough
          description = null
        }
      } else if (needsApproval && !approveSentAndSuccessful) {
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
      if (needsWrap && !wrapSentAndSuccessful) {
        header = wrapHeader
        description = `Submit an on-chain ${isNative ? 'wrap' : 'unwrap'} transaction to convert your ${
          isNative ? nativeSymbol : wrappedSymbol
        } into ${isNative ? wrappedSymbol : nativeSymbol}`
        // pending approve operation
      } else if (needsApproval && !approveSentAndSuccessful) {
        header = `Approve ${wrappedSymbol}`
        description = `Give CoW Protocol permission to swap your ${wrappedSymbol} via an on-chain ERC20 Approve transaction`
      } else {
        // swap operation
        header = swapHeader
        description = swapDescription
      }
    }
    return { header, description }
  }, [
    approveSentAndSuccessful,
    approveSubmitted,
    isExpertMode,
    isNative,
    nativeSymbol,
    needsApproval,
    needsWrap,
    wrapSentAndSuccessful,
    wrapSubmitted,
    wrappedSymbol,
  ])

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

function _getCurrencyForVisualiser<T>(native: T, wrapped: T, isWrap: boolean, isUnwrap: boolean) {
  if (isWrap || isUnwrap) {
    return isWrap ? native : wrapped
  } else {
    return native
  }
}
