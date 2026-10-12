import { useAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { solanaOrderNotPlacedAtom, solanaSigningWindowExpiredAtom } from 'entities/trade'

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
import { useTradeQuote } from 'modules/tradeQuote'
import { useZeroApproveModalState, ZeroApprovalModal } from 'modules/zeroApproval'

import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { SolanaFlowScreen } from './SolanaFlowScreen'

import { useAutoImportTokensState } from '../../hooks/useAutoImportTokensState'
import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { useTradeState } from '../../hooks/useTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'
import { SolanaOrderNotPlaced } from '../../pure/SolanaOrderNotPlaced'
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
  const { quote: tradeQuote, error: tradeQuoteError } = useTradeQuote()
  const [solanaSigningWindowExpired, setSolanaSigningWindowExpired] = useAtom(solanaSigningWindowExpiredAtom)
  const [solanaOrderNotPlaced, setSolanaOrderNotPlaced] = useAtom(solanaOrderNotPlacedAtom)
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
      setSolanaOrderNotPlaced(null)
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
      setSolanaOrderNotPlaced,
    ],
  )

  // Both Solana failure screens exit the same way: nothing was placed, so the way on is another
  // attempt from review. Price confirmation is forced because the quote kept refreshing meanwhile.
  //
  // Unless there is no quote left to confirm: the review screen then shows a disabled confirm
  // button and nothing that says why, so the form — which does report the quote error — is the
  // better place to land.
  const onSolanaFailureDismiss = useCallback(() => {
    setSolanaSigningWindowExpired(null)
    setSolanaOrderNotPlaced(null)

    if (tradeQuoteError || !tradeQuote) {
      closeTradeConfirm()

      return
    }

    openTradeConfirm(true)
  }, [
    setSolanaSigningWindowExpired,
    setSolanaOrderNotPlaced,
    openTradeConfirm,
    closeTradeConfirm,
    tradeQuote,
    tradeQuoteError,
  ])

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
      setSolanaOrderNotPlaced(null)
    }
  }, [closeTradeConfirm, setSolanaSigningWindowExpired, setSolanaOrderNotPlaced])

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
        onDismiss={onSolanaFailureDismiss}
      />
    )
  }

  if (confirmError && solanaOrderNotPlaced) {
    return (
      <SolanaOrderNotPlaced
        errorMessage={solanaOrderNotPlaced.errorMessage}
        logs={solanaOrderNotPlaced.logs}
        inputAmount={solanaOrderNotPlaced.tradeAmounts.inputAmount}
        outputAmount={solanaOrderNotPlaced.tradeAmounts.outputAmount}
        onDismiss={onSolanaFailureDismiss}
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
