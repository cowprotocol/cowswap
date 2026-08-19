import { ReactNode, useCallback } from 'react'

import { DrawerOrDialog, Modal, ModalHeader } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { useAccountModalState } from '../../hooks/useAccountModalState'
import { useCloseAccountModalOnNavigate } from '../../hooks/useCloseAccountModalOnNavigate'
import { useCloseAccountModal } from '../../hooks/useToggleAccountModal'
import { AccountDetails } from '../AccountDetails'

const ACCOUNT_MODAL_MAX_WIDTH = 850

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
    <DrawerOrDialog onOpenChange={handleOpenChange} isOpen={displayOrdersPanel} maxWidth={ACCOUNT_MODAL_MAX_WIDTH}>
      <Modal.Root>
        <ModalHeader sticky title={<Trans>Account</Trans>} onClose={closeAccountModal} />

        <Modal.Content>
          <AccountDetails
            ENSName={ensName}
            pendingTransactions={pendingActivity}
            confirmedTransactions={confirmedActivity}
            handleCloseOrdersPanel={closeAccountModal}
          />
        </Modal.Content>
      </Modal.Root>
    </DrawerOrDialog>
  )
}
