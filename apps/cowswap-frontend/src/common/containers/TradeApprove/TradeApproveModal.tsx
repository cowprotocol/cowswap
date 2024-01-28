import { useAtom } from 'jotai'
import React from 'react'

import { tradeApproveStateAtom } from './tradeApproveStateAtom'

import { usePendingApprovalModal } from '../../hooks/usePendingApprovalModal'
import { CowModal } from '../../pure/Modal'

export function TradeApproveModal() {
  const [{ approveInProgress, currency }, setState] = useAtom(tradeApproveStateAtom)
  const { Modal: PendingApprovalModal } = usePendingApprovalModal()

  const onDismiss = () => setState({ currency, approveInProgress: false })

  return (
    <CowModal isOpen={approveInProgress} onDismiss={onDismiss}>
      {PendingApprovalModal}
    </CowModal>
  )
}
