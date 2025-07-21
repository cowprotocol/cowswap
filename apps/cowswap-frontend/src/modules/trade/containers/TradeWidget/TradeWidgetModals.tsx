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
import { useZeroApproveModalState, ZeroApprovalModal } from 'modules/zeroApproval'

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

interface TradeWidgetModalsProps {
  confirmModal: ReactNode | undefined
  genericModal: ReactNode | undefined
  selectTokenWidget: ReactNode | undefined
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function TradeWidgetModals({
  confirmModal,
  genericModal,
  selectTokenWidget = <SelectTokenWidget />,
}: TradeWidgetModalsProps) {
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

  const resetAllScreens = useCallback(
    (closeTokenSelectWidget = true) => {
      closeTradeConfirm()
      closeZeroApprovalModal()
      closeAutoImportModal()
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

  const error = tokenListAddingError || approveError || confirmError

  /**
   * Close modals on chainId/account change
   */
  useEffect(() => {
    resetAllScreens()
  }, [chainId, account, resetAllScreens])

  /**
   * Close all modals besides token select widget on chain change
   * Because network might be changed from the widget inside
   */
  useEffect(() => {
    resetAllScreens(false)
  }, [chainId, resetAllScreens])

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
