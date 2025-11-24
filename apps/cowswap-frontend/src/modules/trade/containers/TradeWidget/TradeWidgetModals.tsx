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

interface TradeWidgetModalsResetArgs {
  account: string | null | undefined
  chainId: number | undefined
  isOutputTokenSelector: boolean
  closeTradeConfirm: () => void
  closeZeroApprovalModal: () => void
  closeAutoImportModal: () => void
  updateSelectTokenWidgetState: (state: { open: boolean }) => void
  setWrapNativeScreenState: (state: { isOpen: boolean }) => void
  resetApproveModalState: () => void
  setTokenListAddingError: (error: string | null) => void
  updateApproveAmountState: (state: { isModalOpen: boolean }) => void
}

type ModalConfig = {
  show: boolean
  node: ReactNode
}

function useTradeWidgetModalsReset(
  args: TradeWidgetModalsResetArgs,
): (closeTokenSelectWidget?: boolean, shouldCloseAutoImportModal?: boolean) => void {
  const {
    account,
    chainId,
    isOutputTokenSelector,
    closeTradeConfirm,
    closeZeroApprovalModal,
    closeAutoImportModal,
    updateSelectTokenWidgetState,
    setWrapNativeScreenState,
    resetApproveModalState,
    setTokenListAddingError,
    updateApproveAmountState,
  } = args

  const isOutputTokenSelectorRef = useRef(isOutputTokenSelector)

  useEffect(() => {
    isOutputTokenSelectorRef.current = isOutputTokenSelector
  }, [isOutputTokenSelector])

  const resetAllScreens = useCallback(
    (closeTokenSelectWidget = true, shouldCloseAutoImportModal = true) => {
      closeTradeConfirm()
      closeZeroApprovalModal()
      if (shouldCloseAutoImportModal) closeAutoImportModal()
      if (closeTokenSelectWidget) {
        updateSelectTokenWidgetState({ open: false })
      }
      setWrapNativeScreenState({ isOpen: false })
      resetApproveModalState()
      setTokenListAddingError(null)
      updateApproveAmountState({ isModalOpen: false })
    },
    [
      closeTradeConfirm,
      closeZeroApprovalModal,
      closeAutoImportModal,
      updateSelectTokenWidgetState,
      setWrapNativeScreenState,
      resetApproveModalState,
      updateApproveAmountState,
      setTokenListAddingError,
    ],
  )

  useEffect(() => {
    resetAllScreens(true, false)
  }, [account, resetAllScreens])

  useEffect(() => {
    resetAllScreens(isOutputTokenSelectorRef.current)
  }, [chainId, resetAllScreens])

  return resetAllScreens
}

function getModalConfigs(params: {
  genericModal: ReactNode | undefined
  confirmModal: ReactNode | undefined
  selectTokenWidget: ReactNode
  isTradeReviewOpen: boolean
  pendingTrade: unknown
  changeApproveAmountInProgress: boolean
  isTokenSelectOpen: boolean
  isAutoImportModalOpen: boolean
  tokensToImport: Parameters<typeof ImportTokenModal>[0]['tokens']
  closeAutoImportModal: () => void
  importTokenCallback: Parameters<typeof ImportTokenModal>[0]['onImport']
  isWrapNativeOpen: boolean
  error: string | null
  resetAllScreens: (closeTokenSelectWidget?: boolean, shouldCloseAutoImportModal?: boolean) => void
  approveInProgress: boolean
  approvingCurrency: Parameters<typeof TradeApproveModal>[0]['currency']
  isPendingInProgress: Parameters<typeof TradeApproveModal>[0]['isPendingInProgress']
  amountToApprove: Parameters<typeof TradeApproveModal>[0]['amountToApprove']
  isZeroApprovalModalOpen: boolean
  closeZeroApprovalModal: () => void
}): ModalConfig[] {
  return [
    {
      show: !!params.genericModal,
      node: params.genericModal as ReactNode,
    },
    {
      show: params.isTradeReviewOpen || Boolean(params.pendingTrade),
      node: params.confirmModal as ReactNode,
    },
    {
      show: params.changeApproveAmountInProgress,
      node: <TradeChangeApproveAmountModal />,
    },
    {
      show: params.isTokenSelectOpen,
      node: params.selectTokenWidget,
    },
    {
      show: params.isAutoImportModalOpen,
      node: (
        <ImportTokenModal
          tokens={params.tokensToImport}
          onDismiss={params.closeAutoImportModal}
          onImport={params.importTokenCallback}
        />
      ),
    },
    {
      show: params.isWrapNativeOpen,
      node: <WrapNativeModal />,
    },
    {
      show: Boolean(params.error),
      node: <TransactionErrorContent message={params.error ?? ''} onDismiss={params.resetAllScreens} />,
    },
    {
      show: params.approveInProgress,
      node: (
        <TradeApproveModal
          currency={params.approvingCurrency}
          isPendingInProgress={params.isPendingInProgress}
          amountToApprove={params.amountToApprove}
        />
      ),
    },
    {
      show: params.isZeroApprovalModalOpen,
      node: <ZeroApprovalModal onDismiss={params.closeZeroApprovalModal} />,
    },
  ]
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
  const {
    tokensToImport,
    modalState: { isModalOpen: isAutoImportModalOpen, closeModal: closeAutoImportModal },
  } = useAutoImportTokensState(rawState?.inputCurrencyId, rawState?.outputCurrencyId)

  const { onDismiss: closeTradeConfirm } = useTradeConfirmActions()
  const updateSelectTokenWidgetState = useUpdateSelectTokenWidgetState()
  const resetApproveModalState = useResetApproveProgressModalState()
  const updateApproveAmountState = useSetUserApproveAmountModalState()

  const isOutputTokenSelector = field === Field.OUTPUT
  const error = (tokenListAddingError || approveError || confirmError) ?? null

  const resetAllScreens = useTradeWidgetModalsReset({
    account,
    chainId,
    isOutputTokenSelector,
    closeTradeConfirm,
    closeZeroApprovalModal,
    closeAutoImportModal,
    updateSelectTokenWidgetState,
    setWrapNativeScreenState,
    resetApproveModalState,
    setTokenListAddingError,
    updateApproveAmountState,
  })

  const modalConfigs = getModalConfigs({
    genericModal,
    confirmModal,
    selectTokenWidget,
    isTradeReviewOpen,
    pendingTrade,
    changeApproveAmountInProgress,
    isTokenSelectOpen,
    isAutoImportModalOpen,
    tokensToImport,
    closeAutoImportModal,
    importTokenCallback,
    isWrapNativeOpen,
    error,
    resetAllScreens,
    approveInProgress,
    approvingCurrency,
    isPendingInProgress,
    amountToApprove,
    isZeroApprovalModalOpen,
    closeZeroApprovalModal,
  })

  const firstMatchingModal = modalConfigs.find((config) => config.show)

  return firstMatchingModal ? firstMatchingModal.node : null
}
