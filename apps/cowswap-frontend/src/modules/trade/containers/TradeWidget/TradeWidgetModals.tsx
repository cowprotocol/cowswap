import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

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
  SelectTokenWidget,
  useSelectTokenWidgetState,
  useTokenListAddingError,
  useUpdateSelectTokenWidgetState,
} from 'modules/tokensList'
import { useZeroApproveModalState, ZeroApprovalModal } from 'modules/zeroApproval'

import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { useAutoImportTokensState } from '../../hooks/useAutoImportTokensState'
import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { useTradeState } from '../../hooks/useTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'
import { WrapNativeModal } from '../WrapNativeModal'

interface TradeWidgetModalsProps {
  confirmModal: ReactNode | undefined
  genericModal: ReactNode | undefined
  selectTokenWidget: ReactNode | undefined
}

// todo refactor it
// eslint-disable-next-line complexity,max-lines-per-function
export function TradeWidgetModals({
  confirmModal,
  genericModal,
  selectTokenWidget = <SelectTokenWidget />,
}: TradeWidgetModalsProps): ReactNode {
  const { chainId, account } = useWalletInfo()
  const { state: rawState } = useTradeState()
  const importTokenCallback = useAddUserToken()

  const { isOpen: isTradeReviewOpen, error: confirmError, pendingTrade } = useTradeConfirmState()
  const { open: isTokenSelectOpen, field } = useSelectTokenWidgetState()
  const [{ isOpen: isWrapNativeOpen }, setWrapNativeScreenState] = useWrapNativeScreenState()
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

  const { onDismiss: closeTradeConfirm } = useTradeConfirmActions()
  const updateSelectTokenWidgetState = useUpdateSelectTokenWidgetState()
  const resetApproveModalState = useResetApproveProgressModalState()
  const updateApproveAmountState = useSetUserApproveAmountModalState()

  const resetAllScreens = useCallback(
    (closeTokenSelectWidget = true, shouldCloseAutoImportModal = true) => {
      closeTradeConfirm()
      closeZeroApprovalModal()
      closeRwaConsentModal()
      if (shouldCloseAutoImportModal) closeAutoImportModal()
      if (closeTokenSelectWidget) updateSelectTokenWidgetState({ open: false })
      setWrapNativeScreenState({ isOpen: false })
      resetApproveModalState()
      setTokenListAddingError(null)
      updateApproveAmountState({ isModalOpen: false })
    },
    [
      closeTradeConfirm,
      closeZeroApprovalModal,
      closeRwaConsentModal,
      closeAutoImportModal,
      updateSelectTokenWidgetState,
      setWrapNativeScreenState,
      resetApproveModalState,
      updateApproveAmountState,
      setTokenListAddingError,
    ],
  )

  const isOutputTokenSelector = field === Field.OUTPUT
  const isOutputTokenSelectorRef = useRef(isOutputTokenSelector)
  isOutputTokenSelectorRef.current = isOutputTokenSelector

  const error = tokenListAddingError || approveError || confirmError

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
    resetAllScreens(isOutputTokenSelectorRef.current)
  }, [chainId, resetAllScreens])

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

  if (isTokenSelectOpen) {
    return selectTokenWidget
  }

  if (isAutoImportModalOpen) {
    return <ImportTokenModal tokens={tokensToImport} onDismiss={closeAutoImportModal} onImport={importTokenCallback} />
  }

  if (isWrapNativeOpen) {
    return <WrapNativeModal />
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

  return null
}
