// import { useWeb3React } from '@web3-react/core'
import AddressClaimModal from 'components/claim/AddressClaimModal'
// import ConnectedAccountBlocked from 'components/ConnectedAccountBlocked'
// import useAccountRiskCheck from 'hooks/useAccountRiskCheck'
import { useModalIsOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

// mod imports
import { CancellationModal } from '@cow/common/containers/CancellationModal'
import { cancellationModalContextAtom } from '@cow/common/hooks/useCancelOrder/state'
import { useAtomValue } from 'state/application/atoms'
import { MultipleOrdersCancellationModal } from '@cow/common/containers/MultipleOrdersCancellationModal'

export default function TopLevelModals() {
  const addressClaimOpen = useModalIsOpen(ApplicationModal.ADDRESS_CLAIM)
  const addressClaimToggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)

  const cancelModalOpen = useModalIsOpen(ApplicationModal.CANCELLATION)
  const multipleCancelModalOpen = useModalIsOpen(ApplicationModal.MULTIPLE_CANCELLATION)

  const cancelModalToggle = useToggleModal(ApplicationModal.CANCELLATION)
  const multipleCancelModalToggle = useToggleModal(ApplicationModal.MULTIPLE_CANCELLATION)

  const { onDismiss: onDismissCancellationModal } = useAtomValue(cancellationModalContextAtom)

  //   const blockedAccountModalOpen = useModalIsOpen(ApplicationModal.BLOCKED_ACCOUNT)
  //   const { account } = useWalletInfo()

  //   useAccountRiskCheck(account)
  //   const open = Boolean(blockedAccountModalOpen && account)
  return (
    <>
      <AddressClaimModal isOpen={addressClaimOpen} onDismiss={addressClaimToggle} />
      {/* <ConnectedAccountBlocked account={account} isOpen={open} /> */}
      <CancellationModal isOpen={cancelModalOpen} onDismiss={onDismissCancellationModal || cancelModalToggle} />
      <MultipleOrdersCancellationModal isOpen={multipleCancelModalOpen} onDismiss={multipleCancelModalToggle} />
    </>
  )
}
