import { useState, useCallback, useMemo, useEffect } from 'react'
import styled from 'styled-components/macro'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token, CurrencyAmount } from '@uniswap/sdk-core'
import { transparentize } from 'polished'
import { Trans } from '@lingui/macro'

import { ButtonPrimary } from 'components/Button'
import WrappingVisualisation, { WrappingVisualisationParams } from 'components/swap/EthWethWrap/WrappingVisualisation'

import { useCurrencyBalances } from 'state/connection/hooks'

import SimpleAccountDetails from 'components/AccountDetails/SimpleAccountDetails'
import Loader from 'components/Loader'
import { useIsExpertMode } from 'state/user/hooks'
import { delay } from 'utils/misc'
import { useSingleActivityState } from 'hooks/useActivityDerivedState'
import { useWeb3React } from '@web3-react/core'
import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import useRemainingNativeTxsAndCosts from 'hooks/useRemainingNativeTxsAndCosts'
import {
  ActionButtonParams,
  EthFlowState,
  _getActionButtonProps,
  _getCurrencyForVisualiser,
  _getDerivedEthFlowState,
  _getModalTextContent,
} from 'components/swap/EthWethWrap/helpers'

const EthFlowModal = styled(ConfirmationModalContent)`
  padding: 22px;
`

const ModalMessage = styled.p`
  display: flex;
  flex-flow: row wrap;
  padding: 0;
  margin-top: 40px;
  width: 100%;
  color: ${({ theme }) => theme.wallet.color};
`

const LowBalanceMessage = styled(ModalMessage)`
  margin: 0 0 8px;
  background-color: ${({ theme }) => transparentize(0.2, theme.warning)};
  padding: 8px 12px;
  border-radius: 10px;
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  > button {
    min-width: 90%;
    min-height: 60px;
  }
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

type PendingHashMap = { approveHash?: string; wrapHash?: string }

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
  const [pendingHashMap, setPendingHashMap] = useState<PendingHashMap>({
    approveHash: undefined,
    wrapHash: undefined,
  })

  const { chainId } = useWeb3React()
  const isExpertMode = useIsExpertMode()

  // maintain own local state of approve/wrap states
  const [loading, setLoading] = useState(false)
  // APPROVE STATE
  const approveState = useSingleActivityState({ chainId, id: pendingHashMap.approveHash || '' })
  const [approveSubmitted, setApproveSubmitted] = useState(false)
  const [approveError, setApproveError] = useState<Error | null>(null)
  // WRAP STATE
  const wrapState = useSingleActivityState({ chainId, id: pendingHashMap.wrapHash || '' })
  const [wrapSubmitted, setWrapSubmitted] = useState(false)
  const [wrapError, setWrapError] = useState<Error | null>(null)
  // BALANCES
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
  const { balanceChecks } = useRemainingNativeTxsAndCosts({
    native,
    nativeBalance,
    nativeInput,
  })

  // get derived EthFlow state
  const state = useMemo(
    () =>
      _getDerivedEthFlowState({
        approveError,
        wrapError,
        approveState,
        wrapState,
        needsApproval,
        needsWrap,
        isExpertMode,
      }),
    [isExpertMode, approveError, approveState, needsApproval, needsWrap, wrapError, wrapState]
  )
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
  // loading if either approving or wrap pending
  // and set loading local state accordingly..
  useEffect(() => {
    setLoading(state === EthFlowState.Loading)
  }, [state])

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

  const TopModalContent = useCallback(
    () => (
      <EthFlowModalTopContent
        description={description}
        state={state}
        balanceChecks={balanceChecks}
        nativeSymbol={nativeSymbol}
      />
    ),
    [state, balanceChecks, description, nativeSymbol]
  )

  const BottomModalContent = useCallback(() => {
    const params = {
      chainId,
      pendingHashMap,
      approveError,
      wrapError,
      approveState,
      wrapState,
      isNativeIn,
      native,
      wrapped,
      nativeInput,
      nativeBalance,
      wrappedBalance,
      nativeSymbol,
      wrappedSymbol,
      isWrap,
      isUnwrap,
      isExpertMode,
      state,
      loading,
      handleSwap,
      handleWrap,
      handleApprove,
      handleMountInExpertMode,
    }
    return <EthFlowModalBottomContent {...params} />
  }, [
    approveError,
    approveState,
    chainId,
    isExpertMode,
    isNativeIn,
    isUnwrap,
    isWrap,
    loading,
    native,
    nativeBalance,
    nativeInput,
    nativeSymbol,
    pendingHashMap,
    state,
    wrapError,
    wrapState,
    wrapped,
    wrappedBalance,
    wrappedSymbol,
    // cbs
    handleApprove,
    handleMountInExpertMode,
    handleSwap,
    handleWrap,
  ])

  return (
    <EthFlowModal
      title={header}
      titleSize={20}
      onDismiss={onDismiss}
      topContent={TopModalContent}
      bottomContent={BottomModalContent}
    />
  )
}

type TopContentParams = {
  description: string | null
  state: EthFlowState
  balanceChecks: ReturnType<typeof useRemainingNativeTxsAndCosts>['balanceChecks']
  nativeSymbol: string
}

function EthFlowModalTopContent({ description, state, balanceChecks, nativeSymbol }: TopContentParams) {
  return (
    <>
      {description && (
        <ModalMessage>
          <Trans>{description}</Trans>
        </ModalMessage>
      )}
      {/* Warn user if native balance low for on-chain operations EXCEPT if state is ready to swap */}
      {state !== EthFlowState.SwapReady && balanceChecks?.isLowBalance && (
        <LowBalanceMessage>
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
        </LowBalanceMessage>
      )}
    </>
  )
}

function ActionButton({ showButton, showLoader, buttonProps, label }: ReturnType<typeof _getActionButtonProps>) {
  if (!showButton) return null
  return (
    <ButtonWrapper>
      <ButtonPrimary padding="0.5rem" maxWidth="70%" {...buttonProps}>
        {showLoader ? <Loader /> : <Trans>{label}</Trans>}
      </ButtonPrimary>
    </ButtonWrapper>
  )
}

type BottomContentParams = ActionButtonParams &
  WrappingVisualisationParams & {
    isUnwrap: boolean
    pendingHashMap: PendingHashMap
  }

function EthFlowModalBottomContent(params: BottomContentParams) {
  const {
    nativeSymbol,
    wrappedSymbol,
    isWrap,
    isUnwrap,
    pendingHashMap,
    nativeBalance,
    wrappedBalance,
    native,
    wrapped,
    nativeInput,
    chainId,
  } = params
  const actionButtonProps = _getActionButtonProps(params)
  return (
    <>
      <WrappingVisualisation
        nativeSymbol={_getCurrencyForVisualiser(nativeSymbol, wrappedSymbol, isWrap, isUnwrap)}
        nativeBalance={_getCurrencyForVisualiser(nativeBalance, wrappedBalance, isWrap, isUnwrap)}
        native={_getCurrencyForVisualiser(native, wrapped, isWrap, isUnwrap)}
        wrapped={_getCurrencyForVisualiser(wrapped, native, isWrap, isUnwrap)}
        wrappedBalance={_getCurrencyForVisualiser(wrappedBalance, nativeBalance, isWrap, isUnwrap)}
        wrappedSymbol={_getCurrencyForVisualiser(wrappedSymbol, nativeSymbol, isWrap, isUnwrap)}
        nativeInput={nativeInput}
        chainId={chainId}
      />
      <SimpleAccountDetails
        pendingTransactions={Object.values(pendingHashMap).filter(Boolean)}
        confirmedTransactions={[]}
        $margin="12px 0 0"
      />
      <ActionButton {...actionButtonProps} />
    </>
  )
}
