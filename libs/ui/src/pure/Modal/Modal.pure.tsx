import { ModalDescription } from './Description/ModalDescription.pure'
import { ModalFooter } from './Footer/ModalFooter.pure'
import { ModalFooterWithTwoButtons } from './Footer/ModalFooterWithTwoButtons.pure'
import { ModalHeader } from './Header/ModalHeader.pure'
import { ModalContent } from './Modal.styled'
import { ModalRoot } from './Root/ModalRoot.pure'

export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Description: ModalDescription,
  Content: ModalContent,
  Footer: ModalFooter,
  FooterWithTwoButtons: ModalFooterWithTwoButtons,
}
