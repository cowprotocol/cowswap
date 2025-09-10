import { t } from '@lingui/core/macro'

import { ConfirmationModal } from './ConfirmationModal'
import { ConfirmationModalHeader } from './ConfirmationModalHeader'

const Fixtures = {
  default: () => (
    <ConfirmationModal
      isOpen
      title={t`Turn on Expert mode?`}
      confirmWord={t`confirm`}
      action={t`turn on expert mode`}
      onDismiss={() => {}}
      onEnable={() => {}}
    />
  ),
  header: () => <ConfirmationModalHeader onCloseClick={() => {}}>Turn on Expert mode?</ConfirmationModalHeader>,
}

export default Fixtures
