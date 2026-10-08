import { useAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { solanaSigningWindowExpiredAtom } from 'entities/trade'

import { Field } from 'legacy/state/types'

import {
  TradeApproveModal,
  TradeChangeApproveAmountModal,
  useGetUserApproveAmountState,
  useResetApproveProgressModalState,
  useSetUserApproveAmountModalState,
} from 'modules/erc20Approve'
import { useTradeApproveState } from 'modules/erc20Approve/state/useTradeApproveState'
import { RwaConsentModalContainer, useRwaConsentModalState } from 'modules/rwa'
import {
  ImportTokenModal,
  useCloseTokenSelectWidget,
  useSelectTokenWidgetState,
  useTokenListAddingError,
} from 'modules/tokensList'
import { useZeroApproveModalState, ZeroApprovalModal } from 'modules/zeroApproval'

import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { SolanaFlowScreen } from './SolanaFlowScreen'

import { useAutoImportTokensState } from '../../hooks/useAutoImportTokensState'
import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { useTradeState } from '../../hooks/useTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'
import { SolanaSigningWindowExpired } from '../../pure/SolanaSigningWindowExpired'
import { WrapNativeModal } from '../WrapNativeModal'

interface TradeWidgetModalsProps {
  confirmModal: ReactNode | undefined
  genericModal: ReactNode | undefined
  renderFallback?: () => ReactNode
}

// todo refactor it
// eslint-disable-next-line max-lines-per-function
export function TradeWidgetModals({
  confirmModal,
  genericModal,
  renderFallback = () => null,
}: TradeWidgetModalsProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { state: rawState } = useTradeState()
  const importTokenCallback = useAddUserToken()

  const { isOpen: isTradeReviewOpen, error: confirmError, pendingTrade } = useTradeConfirmState()
  const [solanaSigningWindowExpired, setSolanaSigningWindowExpired] = useAtom(solanaSigningWindowExpiredAtom)
  const { field } = useSelectTokenWidgetState()
  const [{ isOpen: isWrapNativeOpen, errorMessage: wrapNativeError }, setWrapNativeScreenState] =
    useWrapNativeScreenState()
  const {
    approveInProgress,
    isPendingInProgress,
    currency: approvingCurrency,
    amountToApprove,
    error: approveError,
  } = useTradeApproveState()
  const { isModalOpen: changeApproveAmountInProgress } = useGetUserApproveAmountState()
  const [tokenListAddingError, setTokenListAddingError] = useTokenListAddingError()
  const { isModalOpen: isZeroApprovalModalOpen, closeModal: closeZeroApprovalModal } = useZeroApproveModalState()
  const { isModalOpen: isRwaConsentModalOpen, closeModal: closeRwaConsentModal } = useRwaConsentModalState()
  const {
    tokensToImport,
    modalState: { isModalOpen: isAutoImportModalOpen, closeModal: closeAutoImportModal },
  } = useAutoImportTokensState(rawState?.inputCurrencyId, rawState?.outputCurrencyId)

  const { onDismiss: closeTradeConfirm, onOpen: openTradeConfirm } = useTradeConfirmActions()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const resetApproveModalState = useResetApproveProgressModalState()
  const updateApproveAmountState = useSetUserApproveAmountModalState()

  const resetAllScreens = useCallback(
    (shouldCloseTokenSelectWidget = true, shouldCloseAutoImportModal = true) => {
      closeTradeConfirm()
      closeZeroApprovalModal()
      closeRwaConsentModal()
      if (shouldCloseAutoImportModal) closeAutoImportModal()
      if (shouldCloseTokenSelectWidget) closeTokenSelectWidget()
      setWrapNativeScreenState({ isOpen: false })
      resetApproveModalState()
      setTokenListAddingError(null)
      updateApproveAmountState({ isModalOpen: false })
      setSolanaSigningWindowExpired(null)
    },
    [
      closeTradeConfirm,
      closeZeroApprovalModal,
      closeRwaConsentModal,
      closeAutoImportModal,
      closeTokenSelectWidget,
      setWrapNativeScreenState,
      resetApproveModalState,
      updateApproveAmountState,
      setTokenListAddingError,
      setSolanaSigningWindowExpired,
    ],
  )

  // Same exit as cancelling the prompt after the window closed: nothing was placed, so the way on
  // is another attempt. Price confirmation is forced because the quote kept refreshing meanwhile.
  const onSigningWindowExpiredDismiss = useCallback(() => {
    setSolanaSigningWindowExpired(null)
    openTradeConfirm(true)
  }, [setSolanaSigningWindowExpired, openTradeConfirm])

  const isOutputTokenSelector = field === Field.OUTPUT
  const previousIsOutputTokenSelector = usePrevious(isOutputTokenSelector)
  const previousChainId = usePrevious(chainId)
  const isInitialRenderRef = useRef(true)

  const error = tokenListAddingError || approveError || confirmError

  /**
   * Reset trade confirm state on unmount so SurplusModalSetup
   * doesn't see stale isOpen/transactionHash after navigation
   */
  useEffect(() => {
    return () => {
      closeTradeConfirm()
      setSolanaSigningWindowExpired(null)
    }
  }, [closeTradeConfirm, setSolanaSigningWindowExpired])

  /**
   * Close all modals besides auto-import on account change
   */
  useEffect(() => {
    resetAllScreens(true, false)
  }, [account, resetAllScreens])

  /**
   * Close all modals besides token select widget on chain change
   * Because network might be changed from the widget inside
   */
  useEffect(() => {
    const isActualChainChange = previousChainId !== null && previousChainId !== chainId

    if (!isActualChainChange && !isInitialRenderRef.current) {
      return
    }

    isInitialRenderRef.current = false

    const shouldCloseTokenSelectWidget = isActualChainChange
      ? isOutputTokenSelector
      : (previousIsOutputTokenSelector ?? isOutputTokenSelector)

    resetAllScreens(shouldCloseTokenSelectWidget, isActualChainChange)
  }, [chainId, isOutputTokenSelector, previousChainId, previousIsOutputTokenSelector, resetAllScreens])

  if (genericModal) {
    return genericModal
  }

  if (isRwaConsentModalOpen) {
    return <RwaConsentModalContainer />
  }

  if (isTradeReviewOpen || pendingTrade) {
    return confirmModal
  }

  if (changeApproveAmountInProgress) {
    return <TradeChangeApproveAmountModal />
  }

  if (isAutoImportModalOpen) {
    return <ImportTokenModal tokens={tokensToImport} onDismiss={closeAutoImportModal} onImport={importTokenCallback} />
  }

  if (isWrapNativeOpen) {
    return (
      <SolanaFlowScreen error={wrapNativeError} onDismiss={() => setWrapNativeScreenState({ isOpen: false })}>
        <WrapNativeModal />
      </SolanaFlowScreen>
    )
  }

  if (confirmError && solanaSigningWindowExpired) {
    return (
      <SolanaSigningWindowExpired
        inputAmount={solanaSigningWindowExpired.inputAmount}
        outputAmount={solanaSigningWindowExpired.outputAmount}
        onDismiss={onSigningWindowExpiredDismiss}
      />
    )
  }

  if (error) {
    return <TransactionErrorContent message={error} onDismiss={resetAllScreens} />
  }

  if (approveInProgress) {
    return (
      <TradeApproveModal
        currency={approvingCurrency}
        isPendingInProgress={isPendingInProgress}
        amountToApprove={amountToApprove}
      />
    )
  }

  if (isZeroApprovalModalOpen) {
    return <ZeroApprovalModal onDismiss={closeZeroApprovalModal} />
  }

  return renderFallback()
}
