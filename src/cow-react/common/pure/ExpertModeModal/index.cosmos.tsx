import { ExpertModeModal, ExpertModeModalProps } from './index'

const defaultProps: ExpertModeModalProps = {
  isOpen: true,
  onDismiss() {
    console.log('Dismiss')
  },
  onEnable() {
    console.log('Enable')
  },
}

export default <ExpertModeModal {...defaultProps} />
