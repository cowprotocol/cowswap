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
  margin-bottom: 20px;
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
  wrapPending: boolean

  onDismiss: () => void
  approveCallback: (params?: { useModals: boolean }) => Promise<TransactionResponse | undefined>
  wrapCallback: ((params?: { useModals: boolean }) => Promise<TransactionResponse | undefined>) | undefined
  swapCallback: () => void
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

  const [approvalSubmitted, setApprovalSubmitted] = useState(false)
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

  // constants
  const { wrapSuccessful, approveSuccessful, isNative, isWrap, isUnwrap, wrappedSymbol, nativeSymbol } = useMemo(
    () => ({
      wrapSuccessful: wrapSubmitted && !isWrapPending,
      approveSuccessful: approvalSubmitted && !isApprovePending,
      isWrap: !isNativeIn && isWrappedOut,
      get isNative() {
        return isNativeIn || this.isWrap
      },
      isUnwrap: !isNativeOut && isWrappedIn,
      wrappedSymbol: wrapped.symbol || 'wrapped native token',
      nativeSymbol: native.symbol || 'native token',
    }),
    [
      approvalSubmitted,
      isApprovePending,
      isNativeIn,
      isNativeOut,
      isWrapPending,
      isWrappedIn,
      isWrappedOut,
      native.symbol,
      wrapSubmitted,
      wrapped.symbol,
    ]
  )

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

  const handleExpertCb = useCallback(async () => {
    setError(null)
    setLoading(true)
    setApprovalSubmitted(false)
    setWrapSubmitted(false)

    try {
      if (needsApproval || needsWrap) {
        const [wrapTx, approveTx] = await Promise.all([
          wrapCallback?.({ useModals: false }),
          approveCallback({ useModals: false }),
        ])
        setPendingHashMap((currTx) => ({
          ...currTx,
          wrapHash: wrapTx?.hash,
          approveHash: approveTx?.hash,
        }))
        setApprovalSubmitted(true)
        setWrapSubmitted(true)
      } else {
        // user doesn't need either, in expert mode we jsut start swap
        swapCallback()
        onDismiss()
      }
    } catch (error) {
      handleError(error)
      setApprovalSubmitted(false)
      setWrapSubmitted(false)
    } finally {
      if (!isNativeIn) {
        onDismiss()
      }
    }
  }, [needsApproval, needsWrap, wrapCallback, approveCallback, swapCallback, handleError, isNativeIn, onDismiss])

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
    setApprovalSubmitted(false)

    try {
      const approveTx = await approveCallback()
      setPendingHashMap((currTx) => ({
        ...currTx,
        approveHash: approveTx?.hash,
      }))
      setApprovalSubmitted(true)
    } catch (error) {
      handleError(error)
      setApprovalSubmitted(false)
    }
  }, [approveCallback, handleError])

  const handleSwap = useCallback(async () => {
    setError(null)

    try {
      await swapCallback()
    } catch (error) {
      handleError(error)
    } finally {
      // close modal after swap initiated
      onDismiss()
    }
  }, [swapCallback, handleError, onDismiss])

  // cb fires on mount (expert mode only)
  useEffect(() => {
    if (isExpertMode) {
      handleExpertCb()
    } else if (isWrap || isUnwrap) {
      // is a pure wrap/unwrap, just start the tx
      handleWrap()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderActionButton = useCallback(() => {
    let actionButton
    if (isExpertMode || ((!needsApproval || approveSuccessful) && (!needsWrap || wrapSuccessful))) {
      actionButton = (
        <ButtonPrimary disabled={loading || !!error} padding="0.5rem" maxWidth="70%" onClick={handleSwap}>
          {loading ? <Loader /> : <Trans>Swap</Trans>}
        </ButtonPrimary>
      )
    } else {
      if (needsWrap && !wrapSuccessful) {
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
      } else if (needsApproval && !approvalSubmitted) {
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
    isApprovePending,
    approvalSubmitted,
    approveSuccessful,
    error,
    handleApprove,
    handleSwap,
    handleWrap,
    isExpertMode,
    isNativeIn,
    isWrap,
    loading,
    nativeSymbol,
    needsApproval,
    needsWrap,
    wrapSuccessful,
    wrappedSymbol,
  ])

  const { header, description } = useMemo(() => {
    // common text
    const swapHeader = `Swap ${wrappedSymbol}`
    const swapDescription = `Submit an off-chain transaction and swap your ${wrappedSymbol}`
    const wrapHeader = isNative ? `Wrap your ${nativeSymbol}` : `Unwrap your ${wrappedSymbol}`

    let header = '',
      description = ''
    // in expert mode we start the logic right away
    if (isExpertMode) {
      if (needsWrap && !wrapSuccessful && needsApproval && !approveSuccessful) {
        header = `Wrap ${isNative ? nativeSymbol : wrappedSymbol} and Approve`
        description = `On-chain ${
          isNative ? nativeSymbol + ' wrap' : wrappedSymbol + ' unwrap'
        } and approve transactions in progress`
      } else if (needsWrap && !wrapSuccessful) {
        header = wrapHeader
        description = `${isNative ? nativeSymbol + ' wrap' : wrappedSymbol + ' unwrap'} transaction in progress`
      } else if (needsApproval && !approveSuccessful) {
        header = `Approving ${wrappedSymbol}`
        description = `${wrappedSymbol} approval transaction in progress`
      } else {
        header = swapHeader
        description = swapDescription
      }
    } else {
      // pending wrap operation
      if (needsWrap && !wrapSuccessful) {
        header = wrapHeader
        description = `Submit an on-chain ${isNative ? 'wrap' : 'unwrap'} transaction to convert your ${
          isNative ? nativeSymbol : wrappedSymbol
        } into ${isNative ? wrappedSymbol : nativeSymbol}`
        // pending approve operation
      } else if (needsApproval && !approveSuccessful) {
        header = `Approve ${wrappedSymbol}`
        description = `Give CoW Protocol permission to swap your ${wrappedSymbol} via an on-chain ERC20 Approve transaction`
      } else {
        // swap operation
        header = swapHeader
        description = swapDescription
      }
    }
    return { header, description }
  }, [approveSuccessful, isExpertMode, isNative, nativeSymbol, needsApproval, needsWrap, wrapSuccessful, wrappedSymbol])

  return (
    <Wrapper>
      <RowBetween marginBottom={20}>
        <ThemedText.MediumHeader>
          <Trans>{header}</Trans>
        </ThemedText.MediumHeader>
        <CloseIcon onClick={onDismiss} />
      </RowBetween>

      <ModalMessage>
        <span>
          <Trans>{description}</Trans>
        </span>
      </ModalMessage>
      {balanceChecks?.isLowBalance && (
        <ModalMessage>
          <span>
            <Trans>
              At current gas prices, your remaining {nativeSymbol} balance after confirmation would be{' '}
              {!balanceChecks.txsRemaining ? (
                <strong>insufficient for any further on-chain transactions.</strong>
              ) : (
                <>
                  sufficient for{' '}
                  <strong>up to {balanceChecks.txsRemaining} wrapping, unwrapping, or enabling operation(s)</strong>.
                </>
              )}
            </Trans>
          </span>
        </ModalMessage>
      )}
      <SimpleAccountDetails pendingTransactions={Object.values(pendingHashMap)} confirmedTransactions={[]} />
      <WrappingVisualisation
        nativeSymbol={nativeSymbol}
        nativeBalance={nativeBalance}
        native={native}
        wrapped={wrapped}
        wrappedBalance={wrappedBalance}
        wrappedSymbol={wrappedSymbol}
        nativeInput={nativeInput}
      />
      {renderActionButton()}
    </Wrapper>
  )
}
