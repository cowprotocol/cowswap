import { ZeroApprovalModal } from './ZeroApprovalModal'

const modalState = {
  isModalOpen: true,
  openModal: () => {},
  closeModal: () => {},
}

const Fixtures = {
  default: <ZeroApprovalModal modalState={modalState} />,
}

export default Fixtures
