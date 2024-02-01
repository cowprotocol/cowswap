import { useAtom, useAtomValue } from 'jotai'
import React, { ReactNode } from 'react'

import { useAddUserToken } from '@cowprotocol/tokens'

import { ImportTokenModal, SelectTokenWidget, selectTokenWidgetAtom } from 'modules/tokensList'
import { useZeroApproveModalState, ZeroApprovalModal } from 'modules/zeroApproval'

import { TradeApproveModal } from 'common/containers/TradeApprove'
import { tradeApproveStateAtom } from 'common/containers/TradeApprove/tradeApproveStateAtom'

import { useAutoImportTokensState } from '../../hooks/useAutoImportTokensState'
import { useTradeState } from '../../hooks/useTradeState'
import { tradeConfirmStateAtom } from '../../state/tradeConfirmStateAtom'
import { wrapNativeStateAtom } from '../../state/wrapNativeStateAtom'
import { WrapNativeModal } from '../WrapNativeModal'

export function TradeWidgetModals(confirmModal: ReactNode | undefined) {
  const { state: rawState } = useTradeState()
  const importTokenCallback = useAddUserToken()

  const { isOpen: isTradeReviewOpen } = useAtomValue(tradeConfirmStateAtom)
  const { open: isTokenSelectOpen } = useAtomValue(selectTokenWidgetAtom)
  const [{ isOpen: isWrapNativeOpen }] = useAtom(wrapNativeStateAtom)
  const [{ approveInProgress, currency: approvingCurrency }] = useAtom(tradeApproveStateAtom)

  const { isModalOpen: isZeroApprovalModalOpen, closeModal: closeZeroApprovalModal } = useZeroApproveModalState()
  const {
    tokensToImport,
    modalState: { isModalOpen: isAutoImportModalOpen, closeModal: closeAutoImportModal },
  } = useAutoImportTokensState(rawState?.inputCurrencyId, rawState?.outputCurrencyId)

  if (isTradeReviewOpen) {
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
  if (approveInProgress) {
    return <TradeApproveModal currency={approvingCurrency} />
  }

  if (isZeroApprovalModalOpen) {
    return <ZeroApprovalModal onDismiss={closeZeroApprovalModal} />
  }

  return null
}
