import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'
import { DrawerOrDialog, Modal, ModalHeader } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

import { useAccountModalState } from '../../hooks/useAccountModalState'
import { useCloseAccountModalOnNavigate } from '../../hooks/useCloseAccountModalOnNavigate'
import { useToggleAccountModal } from '../../hooks/useToggleAccountModal'
import { AccountDetails } from '../AccountDetails'

const ACCOUNT_MODAL_MAX_WIDTH = 850

// TODO: rename the component into AccountModal
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OrdersPanel() {
  const { active, account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const { isOpen } = useAccountModalState()
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()

  const handleCloseOrdersPanel = useToggleAccountModal()

  useCloseAccountModalOnNavigate()

  const displayOrdersPanel = !!(active && isOpen && account)

  useBodyScrollbarLocker(displayOrdersPanel)

  if (!displayOrdersPanel) {
    return null
  }

  return (
    <DrawerOrDialog onOpenChange={handleCloseOrdersPanel} isOpen={isOpen} maxWidth={ACCOUNT_MODAL_MAX_WIDTH}>
      <Modal.Root>
        <ModalHeader sticky title={<Trans>Account</Trans>} onClose={handleCloseOrdersPanel} />

        <Modal.Content>
          <AccountDetails
            ENSName={ensName}
            pendingTransactions={pendingActivity}
            confirmedTransactions={confirmedActivity}
            handleCloseOrdersPanel={handleCloseOrdersPanel}
          />
        </Modal.Content>
      </Modal.Root>
    </DrawerOrDialog>
  )
}
