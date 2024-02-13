import React from 'react'

import { AutoImportTokens, SelectTokenWidget } from 'modules/tokensList'
import { ZeroApprovalModal, useZeroApproveModalState } from 'modules/zeroApproval'

import { TradeApproveModal } from 'common/containers/TradeApprove'
import { CowModal } from 'common/pure/Modal'

import { useTradeState } from '../../hooks/useTradeState'

export function TradeWidgetModals() {
  const { state: rawState } = useTradeState()
  const { isModalOpen: isZeroApprovalModalOpen, closeModal: closeZeroApprovalModal } = useZeroApproveModalState()

  return (
    <>
      <AutoImportTokens inputToken={rawState?.inputCurrencyId} outputToken={rawState?.outputCurrencyId} />
      <CowModal onDismiss={closeZeroApprovalModal} isOpen={isZeroApprovalModalOpen}>
        <ZeroApprovalModal onDismiss={closeZeroApprovalModal} />
      </CowModal>
      <TradeApproveModal />
      <SelectTokenWidget />
    </>
  )
}
