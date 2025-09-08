import { ReactNode } from 'react'

// todo move modal header to common
import { ModalHeader } from '@cowprotocol/ui'

import { useSetChangeApproveAmountState } from '../../state'

export function ChangeApproveAmountModal(): ReactNode {
  const setChangeApproveAmountState = useSetChangeApproveAmountState()

  const onBack = (): void => {
    setChangeApproveAmountState({ isModalOpen: false })
  }

  return (
    <ModalHeader onBack={onBack}>
      <span>Edit partial approval</span>
    </ModalHeader>
  )
}
