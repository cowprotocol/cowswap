import { ReactNode, useCallback } from 'react'

import { Dialog, Modal, ModalHeader } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { useAccountModalState } from '../../hooks/useAccountModalState'
import { useCloseAccountModalOnNavigate } from '../../hooks/useCloseAccountModalOnNavigate'
import { useCloseAccountModal } from '../../hooks/useToggleAccountModal'
import { AccountDetails } from '../AccountDetails'

export function AccountModal(): ReactNode {
  const { active, account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const { isOpen } = useAccountModalState()
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()
  const closeAccountModal = useCloseAccountModal()

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeAccountModal()
      }
    },
    [closeAccountModal],
  )

  useCloseAccountModalOnNavigate()

  const displayOrdersPanel = !!(active && isOpen && account)

  return (
    <Dialog onOpenChange={handleOpenChange} isOpen={displayOrdersPanel}>
      <Modal.Root>
        <ModalHeader sticky title={<Trans>Account</Trans>} titleAs={Dialog.Title} onClose={closeAccountModal} />

        <Modal.Content>
          <AccountDetails
            ENSName={ensName}
            pendingTransactions={pendingActivity}
            confirmedTransactions={confirmedActivity}
            handleCloseOrdersPanel={closeAccountModal}
          />
        </Modal.Content>
      </Modal.Root>
    </Dialog>
  )
}
