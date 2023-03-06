import AddressClaimModal from 'components/claim/AddressClaimModal'
import ConnectedAccountBlocked from '@cow/modules/account/pure/ConnectedAccountBlocked'
import useAccountRiskCheck from 'hooks/useAccountRiskCheck'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useWalletInfo } from '@cow/modules/wallet'

export default function TopLevelModals() {
  const addressClaimOpen = useModalIsOpen(ApplicationModal.ADDRESS_CLAIM)
  const addressClaimToggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  const blockedAccountModalOpen = useModalIsOpen(ApplicationModal.BLOCKED_ACCOUNT)
  const { account } = useWalletInfo()

  useAccountRiskCheck(account)
  const open = Boolean(blockedAccountModalOpen && account)
  return (
    <>
      <AddressClaimModal isOpen={addressClaimOpen} onDismiss={addressClaimToggle} />
      <ConnectedAccountBlocked account={account} isOpen={open} />
    </>
  )
}
