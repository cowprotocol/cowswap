import { ReactNode, useCallback, useEffect } from 'react'

import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import {
  ImportTokenModal,
  SelectTokenWidget,
  useSelectTokenWidgetState,
  useTokenListAddingError,
  useUpdateSelectTokenWidgetState,
} from 'modules/tokensList'
import { ZeroApprovalModal, useZeroApproveModalState } from 'modules/zeroApproval'

import { TradeApproveModal } from 'common/containers/TradeApprove'
import { useTradeApproveState } from 'common/hooks/useTradeApproveState'
import { useUpdateTradeApproveState } from 'common/hooks/useUpdateTradeApproveState'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { useAutoImportTokensState } from '../../hooks/useAutoImportTokensState'
import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { useTradeConfirmState } from '../../hooks/useTradeConfirmState'
import { useTradeState } from '../../hooks/useTradeState'
import { useWrapNativeScreenState } from '../../hooks/useWrapNativeScreenState'
import { WrapNativeModal } from '../WrapNativeModal'

export function TradeWidgetModals(confirmModal: ReactNode | undefined, genericModal: ReactNode | undefined) {
  const { chainId, account } = useWalletInfo()
  const { state: rawState } = useTradeState()
  const importTokenCallback = useAddUserToken()

  const { isOpen: isTradeReviewOpen, error: confirmError, pendingTrade } = useTradeConfirmState()
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()
  const [{ isOpen: isWrapNativeOpen }, setWrapNativeScreenState] = useWrapNativeScreenState()
  const { approveInProgress, currency: approvingCurrency, error: approveError } = useTradeApproveState()
  const [tokenListAddingError, setTokenListAddingError] = useTokenListAddingError()
  const { isModalOpen: isZeroApprovalModalOpen, closeModal: closeZeroApprovalModal } = useZeroApproveModalState()
  const {
    tokensToImport,
    modalState: { isModalOpen: isAutoImportModalOpen, closeModal: closeAutoImportModal },
  } = useAutoImportTokensState(rawState?.inputCurrencyId, rawState?.outputCurrencyId)

  const { onDismiss: closeTradeConfirm } = useTradeConfirmActions()
  const updateSelectTokenWidgetState = useUpdateSelectTokenWidgetState()
  const updateTradeApproveState = useUpdateTradeApproveState()

  const resetAllScreens = useCallback(() => {
    closeTradeConfirm()
    closeZeroApprovalModal()
    closeAutoImportModal()
    updateSelectTokenWidgetState({ open: false })
    setWrapNativeScreenState({ isOpen: false })
    updateTradeApproveState({ approveInProgress: false, error: undefined })
    setTokenListAddingError(null)
  }, [
    closeTradeConfirm,
    closeZeroApprovalModal,
    closeAutoImportModal,
    updateSelectTokenWidgetState,
    setWrapNativeScreenState,
    updateTradeApproveState,
    setTokenListAddingError,
  ])

  const error = tokenListAddingError || approveError || confirmError

  /**
   * Close modals on chain/account change
   */
  useEffect(() => {
    resetAllScreens()
  }, [chainId, account, resetAllScreens])

  if (genericModal) {
    return genericModal
  }

  if (isTradeReviewOpen || pendingTrade) {
    return confirmModal
  }

  if (isAutoImportModalOpen) {
    return <ImportTokenModal tokens={tokensToImport} onDismiss={closeAutoImportModal} onImport={importTokenCallback} />
  }

  if (isTokenSelectOpen) {
    return <SelectTokenWidget />
  }

  if (isWrapNativeOpen) {
    return <WrapNativeModal />
  }

  if (error) {
    return <TransactionErrorContent message={error} onDismiss={resetAllScreens} />
  }

  if (approveInProgress) {
    return <TradeApproveModal currency={approvingCurrency} />
  }

  if (isZeroApprovalModalOpen) {
    return <ZeroApprovalModal onDismiss={closeZeroApprovalModal} />
  }

  return null
}
