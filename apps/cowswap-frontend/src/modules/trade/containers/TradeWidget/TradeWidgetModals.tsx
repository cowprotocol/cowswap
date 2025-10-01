import { ReactNode, useCallback, useEffect } from 'react'

import { useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { TradeApproveModal, useUpdateTradeApproveState } from 'modules/erc20Approve'
import { useTradeApproveState } from 'modules/erc20Approve/state/useTradeApproveState'
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

  const resetAllScreens = useCallback(
    (closeTokenSelectWidget = true, shouldCloseAutoImportModal = true) => {
      closeTradeConfirm()
      closeZeroApprovalModal()
      if (shouldCloseAutoImportModal) {
        closeAutoImportModal()
      }
      if (closeTokenSelectWidget) {
        updateSelectTokenWidgetState({ open: false })
      }
      setWrapNativeScreenState({ isOpen: false })
      updateTradeApproveState({ approveInProgress: false, error: undefined })
      setTokenListAddingError(null)
    },
    [
      closeTradeConfirm,
      closeZeroApprovalModal,
      closeAutoImportModal,
      updateSelectTokenWidgetState,
      setWrapNativeScreenState,
      updateTradeApproveState,
      setTokenListAddingError,
    ],
  )

  const isOutputTokenSelector = field == Field.OUTPUT
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
    resetAllScreens(isOutputTokenSelector)
  }, [chainId, resetAllScreens, isOutputTokenSelector])

  if (genericModal) {
    return genericModal
  }

  if (isTradeReviewOpen || pendingTrade) {
    return confirmModal
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
    return <TradeApproveModal currency={approvingCurrency} />
  }

  if (isZeroApprovalModalOpen) {
    return <ZeroApprovalModal onDismiss={closeZeroApprovalModal} />
  }

  return null
}
