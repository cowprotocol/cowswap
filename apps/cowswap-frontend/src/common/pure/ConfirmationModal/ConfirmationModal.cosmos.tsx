import { Trans } from '@lingui/macro'

import { ConfirmationModal } from './ConfirmationModal'
import { ConfirmationModalHeader } from './ConfirmationModalHeader'

const Fixtures = {
  default: () => (
    <ConfirmationModal
      isOpen
      title="Turn on Expert mode?"
      confirmWord="confirm"
      action="turn on expert mode"
      onDismiss={() => {}}
      onEnable={() => {}}
    />
  ),
  header: () => (
    <ConfirmationModalHeader onCloseClick={() => {}}>
      <Trans>Turn on Expert mode?</Trans>
    </ConfirmationModalHeader>
  ),
}

export default Fixtures
